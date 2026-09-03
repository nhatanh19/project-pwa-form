import { Hono } from 'hono';
import { Env } from '../../types/env';

export const analyticsRouter = new Hono<{ Bindings: Env }>();

const FALLBACK_ANALYTICS = {
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

analyticsRouter.get('/summary', async (c) => {
  const surveyId = c.req.query('survey_id') || 'survey-traffic-2026';
  const db = c.env?.DB;

  if (!db) {
    return c.json({
      success: true,
      data: FALLBACK_ANALYTICS,
    });
  }

  try {
    // 1. KPI Cards Summary
    const totalRespRes = await db
      .prepare('SELECT COUNT(*) AS total FROM responses WHERE survey_id = ?')
      .bind(surveyId)
      .first<{ total: number }>();

    const avgCostRes = await db
      .prepare(
        `SELECT ROUND(AVG(numeric_value), 0) AS avg_cost 
         FROM answers 
         WHERE question_id = 'q_monthly_cost' AND numeric_value IS NOT NULL`
      )
      .first<{ avg_cost: number | null }>();

    const avgGreenRes = await db
      .prepare(
        `SELECT ROUND(AVG(numeric_value), 2) AS avg_rating 
         FROM answers 
         WHERE question_id = 'q_green_readiness' AND numeric_value IS NOT NULL`
      )
      .first<{ avg_rating: number | null }>();

    const totalResponses = totalRespRes?.total || 0;
    const avgMonthlyCost = avgCostRes?.avg_cost || 0;
    const avgGreenReadiness = avgGreenRes?.avg_rating || 0;

    // 2. Cơ cấu phương tiện di chuyển chính (Pie Chart)
    const transportModesRes = await db
      .prepare(
        `SELECT 
           o.id AS option_id,
           o.option_text AS transport_mode,
           COUNT(a.id) AS count,
           ROUND(COUNT(a.id) * 100.0 / MAX(1, (SELECT COUNT(*) FROM answers WHERE question_id = 'q_transport_mode')), 1) AS percentage
         FROM options o
         LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_transport_mode'
         WHERE o.question_id = 'q_transport_mode'
         GROUP BY o.id, o.option_text, o.order_num
         ORDER BY o.order_num ASC`
      )
      .all<{
        option_id: string;
        transport_mode: string;
        count: number;
        percentage: number;
      }>();

    // 3. Phân bổ cự ly di chuyển (Bar Chart)
    const distanceRes = await db
      .prepare(
        `SELECT 
           o.id AS option_id,
           o.option_text AS distance_range,
           COUNT(a.id) AS count,
           ROUND(COUNT(a.id) * 100.0 / MAX(1, (SELECT COUNT(*) FROM answers WHERE question_id = 'q_daily_distance')), 1) AS percentage
         FROM options o
         LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_daily_distance'
         WHERE o.question_id = 'q_daily_distance'
         GROUP BY o.id, o.option_text, o.order_num
         ORDER BY o.order_num ASC`
      )
      .all<{
        option_id: string;
        distance_range: string;
        count: number;
        percentage: number;
      }>();

    // 4. Lý do chính chọn phương tiện (Multiple Choice Bar Chart)
    const reasonsRes = await db
      .prepare(
        `SELECT 
           o.id AS option_id,
           o.option_text AS reason,
           COUNT(a.id) AS count
         FROM options o
         LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_reasons'
         WHERE o.question_id = 'q_reasons'
         GROUP BY o.id, o.option_text, o.order_num
         ORDER BY count DESC`
      )
      .all<{
        option_id: string;
        reason: string;
        count: number;
      }>();

    // 5. Đánh giá phương tiện xanh (1 - 5 sao)
    const ratingRes = await db
      .prepare(
        `SELECT 
           r.rating_score,
           COUNT(a.id) AS count
         FROM (
           SELECT 1 AS rating_score UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
         ) r
         LEFT JOIN answers a ON CAST(a.numeric_value AS INTEGER) = r.rating_score AND a.question_id = 'q_green_readiness'
         GROUP BY r.rating_score
         ORDER BY r.rating_score ASC`
      )
      .all<{
        rating_score: number;
        count: number;
      }>();

    return c.json({
      success: true,
      data: {
        kpis: {
          total_responses: totalResponses,
          avg_monthly_cost: avgMonthlyCost,
          avg_green_readiness: avgGreenReadiness,
        },
        transport_modes: transportModesRes.results || [],
        daily_distances: distanceRes.results || [],
        reasons: reasonsRes.results || [],
        green_readiness: ratingRes.results || [],
        last_updated: new Date().toISOString(),
      },
    });
  } catch {
    return c.json({
      success: true,
      data: FALLBACK_ANALYTICS,
    });
  }
});
