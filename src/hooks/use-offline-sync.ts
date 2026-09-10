import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { SurveySubmission } from '../types/survey';
import { OfflineSubmissionRecord, BatchSyncResponse } from '../types/sync';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('last_synced_at');
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [syncSuccessToast, setSyncSuccessToast] = useState<{ count: number; timestamp: number } | null>(null);

  // Lấy danh sách các bản ghi chưa sync từ IndexedDB (reactive tự cập nhật UI)
  const pendingSubmissions = useLiveQuery(
    () => db.offline_submissions.where('is_synced').equals(0).toArray(),
    []
  ) || [];

  const isSyncingRef = useRef(false);

  // 1. Hàm thực hiện đẩy dữ liệu đồng bộ (Batch Sync)
  const triggerSync = useCallback(async (): Promise<{ success: boolean; count: number }> => {
    if (isSyncingRef.current) return { success: false, count: 0 };
    if (!navigator.onLine) {
      return { success: false, count: 0 };
    }

    // Lấy các bản ghi chưa đồng bộ
    const unsyncedList = await db.offline_submissions.where('is_synced').equals(0).toArray();
    if (unsyncedList.length === 0) {
      return { success: true, count: 0 };
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    setLastError(null);

    try {
      // Chuẩn bị payload đầy đủ bao gồm cả GPS và thời lượng
      const payload: { submissions: SurveySubmission[] } = {
        submissions: unsyncedList.map((item) => ({
          id: item.id,
          survey_id: item.survey_id || 'survey-traffic-2026',
          enumerator_id: item.enumerator_id,
          client_created_at: item.client_created_at,
          completed_at: item.completed_at,
          survey_duration_seconds: item.survey_duration_seconds,
          location: item.location,
          photo_data: item.photo_data,
          answers: item.answers,
          device_info: item.device_info,
        })),
      };

      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Máy chủ phản hồi mã ${response.status}: ${errText.slice(0, 100)}`);
      }

      const result: BatchSyncResponse = await response.json();

      if (result.success) {
        // Cập nhật trạng thái trong IndexedDB sang đã sync
        const syncedIds = unsyncedList.map((item) => item.id);
        
        await db.transaction('rw', db.offline_submissions, async () => {
          for (const id of syncedIds) {
            await db.offline_submissions.update(id, {
              is_synced: 1,
              last_attempt_at: new Date().toISOString(),
              error_message: undefined,
            });
          }
        });

        const now = new Date().toISOString();
        setLastSyncedAt(now);
        localStorage.setItem('last_synced_at', now);
        setSyncSuccessToast({ count: result.synced_count, timestamp: Date.now() });

        return { success: true, count: result.synced_count };
      } else {
        throw new Error(result.message || 'Lỗi xử lý đồng bộ từ máy chủ');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối mạng';
      console.warn('Sync attempt failed:', msg);
      setLastError(msg);

      // Ghi nhận lần thử thất bại vào IndexedDB
      for (const item of unsyncedList) {
        await db.offline_submissions.update(item.id, {
          sync_attempts: (item.sync_attempts || 0) + 1,
          last_attempt_at: new Date().toISOString(),
          error_message: msg,
        });
      }
      return { success: false, count: 0 };
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // 2. Hàm lưu bản ghi khảo sát (Luôn ghi vào Dexie trước - Offline First)
  const saveSubmission = useCallback(
    async (submission: SurveySubmission): Promise<{ savedOffline: boolean; syncedImmediately: boolean }> => {
      const record: OfflineSubmissionRecord = {
        ...submission,
        is_synced: 0,
        sync_attempts: 0,
      };

      // 1. Lưu vào IndexedDB an toàn 100%
      await db.offline_submissions.put(record);

      // 2. Nếu đang online, kích hoạt sync ngay lập tức
      if (navigator.onLine) {
        try {
          const syncRes = await triggerSync();
          return { savedOffline: true, syncedImmediately: syncRes.success };
        } catch {
          return { savedOffline: true, syncedImmediately: false };
        }
      }

      return { savedOffline: true, syncedImmediately: false };
    },
    [triggerSync]
  );

  // 3. Lắng nghe trạng thái Online / Offline của trình duyệt
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // TỰ ĐỘNG TRIGGER SYNC KHI CÓ MẠNG TRỞ LẠI
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Kích hoạt sync khi component mount nếu có kết nối
    if (navigator.onLine) {
      triggerSync();
    }

    // Định kỳ kiểm tra và đẩy lại hàng đợi mỗi 30 giây nếu online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync]);

  return {
    isOnline,
    pendingCount: pendingSubmissions.length,
    pendingSubmissions,
    isSyncing,
    lastSyncedAt,
    lastError,
    syncSuccessToast,
    saveSubmission,
    triggerSync,
  };
}
