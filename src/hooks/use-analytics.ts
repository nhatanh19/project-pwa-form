import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/dexie';
import { AnalyticsSummaryData } from '../types/analytics';

const FALLBACK_ANALYTICS: AnalyticsSummaryData = {
  kpis: {
    total_responses: 0,
    avg_monthly_cost: 0,
    avg_green_readiness: 0,
  },
  transport_modes: [
    { option_id: 'opt_trans_motorbike', transport_mode: 'Xe máy cá nhân', count: 0, percentage: 0 },
    { option_id: 'opt_trans_bus', transport_mode: 'Xe buýt công cộng', count: 0, percentage: 0 },
    { option_id: 'opt_trans_bike_walk', transport_mode: 'Xe đạp / Đi bộ', count: 0, percentage: 0 },
    { option_id: 'opt_trans_ride_hail', transport_mode: 'Xe công nghệ / Taxi', count: 0, percentage: 0 },
    { option_id: 'opt_trans_car', transport_mode: 'Ô tô cá nhân', count: 0, percentage: 0 },
  ],
  daily_distances: [
    { option_id: 'opt_dist_under_3km', distance_range: 'Dưới 3km', count: 0, percentage: 0 },
    { option_id: 'opt_dist_3_7km', distance_range: '3 - 7km', count: 0, percentage: 0 },
    { option_id: 'opt_dist_7_15km', distance_range: '7 - 15km', count: 0, percentage: 0 },
    { option_id: 'opt_dist_over_15km', distance_range: 'Trên 15km', count: 0, percentage: 0 },
  ],
  reasons: [
    { option_id: 'opt_reason_cost', reason: 'Tiết kiệm chi phí', count: 0 },
    { option_id: 'opt_reason_time', reason: 'Tiết kiệm thời gian', count: 0 },
    { option_id: 'opt_reason_flexibility', reason: 'Tiện lợi / Linh hoạt', count: 0 },
    { option_id: 'opt_reason_safety', reason: 'An toàn / Tránh mưa nắng', count: 0 },
  ],
  green_readiness: [
    { rating_score: 1, count: 0 },
    { rating_score: 2, count: 0 },
    { rating_score: 3, count: 0 },
    { rating_score: 4, count: 0 },
    { rating_score: 5, count: 0 },
  ],
  last_updated: new Date().toISOString(),
};

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsSummaryData>(FALLBACK_ANALYTICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setIsError(null);

    // 1. Nạp từ Cache IndexedDB trước
    try {
      const cached = await db.analytics_cache.get('summary');
      if (cached && cached.data) {
        setData(cached.data);
      }
    } catch (e) {
      console.warn('Lỗi đọc analytics cache:', e);
    }

    // 2. Nếu online, gọi backend
    if (navigator.onLine) {
      try {
        const res = await fetch('/api/analytics/summary');
        if (res.ok) {
          const json = (await res.json()) as { success: boolean; data: AnalyticsSummaryData };
          if (json.success && json.data) {
            setData(json.data);
            // Cập nhật Cache
            await db.analytics_cache.put({
              id: 'summary',
              data: json.data,
              cached_at: new Date().toISOString(),
            });
          }
        } else {
          setIsError('Không thể lấy báo cáo mới nhất từ server');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
        setIsError(msg);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    isError,
    refreshAnalytics: fetchAnalytics,
  };
}
