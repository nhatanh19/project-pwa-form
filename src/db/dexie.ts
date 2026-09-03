import Dexie, { type Table } from 'dexie';
import { Survey } from '../types/survey';
import { OfflineSubmissionRecord } from '../types/sync';
import { AnalyticsSummaryData } from '../types/analytics';

// Bộ câu hỏi mặc định tích hợp sẵn (Initial Seed Fallback) để đảm bảo offline 100% ngay từ lần mở đầu tiên
export const DEFAULT_SURVEY: Survey = {
  id: 'survey-traffic-2026',
  title: 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
  description: 'Khảo sát thực địa phục vụ nghiên cứu và đánh giá xu hướng chuyển đổi phương tiện giao thông cá nhân sang giao thông công cộng & xe điện.',
  is_active: 1,
  questions: [
    {
      id: 'q_transport_mode',
      survey_id: 'survey-traffic-2026',
      order_num: 1,
      question_text: 'Phương tiện di chuyển chính hàng ngày của bạn là gì?',
      question_type: 'SINGLE_CHOICE',
      is_required: 1,
      options: [
        { id: 'opt_trans_motorbike', question_id: 'q_transport_mode', option_text: 'Xe máy cá nhân', order_num: 1 },
        { id: 'opt_trans_bus', question_id: 'q_transport_mode', option_text: 'Xe buýt công cộng', order_num: 2 },
        { id: 'opt_trans_bike_walk', question_id: 'q_transport_mode', option_text: 'Xe đạp / Đi bộ', order_num: 3 },
        { id: 'opt_trans_ride_hail', question_id: 'q_transport_mode', option_text: 'Xe công nghệ / Taxi', order_num: 4 },
        { id: 'opt_trans_car', question_id: 'q_transport_mode', option_text: 'Ô tô cá nhân', order_num: 5 },
      ],
    },
    {
      id: 'q_daily_distance',
      survey_id: 'survey-traffic-2026',
      order_num: 2,
      question_text: 'Quãng đường di chuyển trung bình mỗi ngày của bạn?',
      question_type: 'SINGLE_CHOICE',
      is_required: 1,
      options: [
        { id: 'opt_dist_under_3km', question_id: 'q_daily_distance', option_text: 'Dưới 3km', order_num: 1 },
        { id: 'opt_dist_3_7km', question_id: 'q_daily_distance', option_text: '3 - 7km', order_num: 2 },
        { id: 'opt_dist_7_15km', question_id: 'q_daily_distance', option_text: '7 - 15km', order_num: 3 },
        { id: 'opt_dist_over_15km', question_id: 'q_daily_distance', option_text: 'Trên 15km', order_num: 4 },
      ],
    },
    {
      id: 'q_monthly_cost',
      survey_id: 'survey-traffic-2026',
      order_num: 3,
      question_text: 'Chi phí xăng xe / vé xe ước tính mỗi tháng của bạn (VNĐ)?',
      question_type: 'NUMERIC',
      is_required: 1,
      min_val: 0,
      max_val: 5000000,
      step_val: 50000,
      unit: 'VNĐ',
    },
    {
      id: 'q_reasons',
      survey_id: 'survey-traffic-2026',
      order_num: 4,
      question_text: 'Lý do chính bạn ưu tiên sử dụng phương tiện hiện tại?',
      question_type: 'MULTIPLE_CHOICE',
      is_required: 1,
      options: [
        { id: 'opt_reason_cost', question_id: 'q_reasons', option_text: 'Tiết kiệm chi phí', order_num: 1 },
        { id: 'opt_reason_time', question_id: 'q_reasons', option_text: 'Tiết kiệm thời gian', order_num: 2 },
        { id: 'opt_reason_flexibility', question_id: 'q_reasons', option_text: 'Tiện lợi / Linh hoạt', order_num: 3 },
        { id: 'opt_reason_safety', question_id: 'q_reasons', option_text: 'An toàn / Tránh mưa nắng', order_num: 4 },
      ],
    },
    {
      id: 'q_green_readiness',
      survey_id: 'survey-traffic-2026',
      order_num: 5,
      question_text: 'Mức độ sẵn sàng chuyển sang phương tiện xanh (Xe điện / Xe buýt điện)?',
      question_type: 'RATING',
      is_required: 1,
      min_val: 1,
      max_val: 5,
      step_val: 1,
      unit: 'Sao',
    },
  ],
};

export class TrafficSurveyDexieDB extends Dexie {
  surveys!: Table<Survey, string>;
  offline_submissions!: Table<OfflineSubmissionRecord, string>;
  analytics_cache!: Table<{ id: string; data: AnalyticsSummaryData; cached_at: string }, string>;

  constructor() {
    super('TrafficSurveyOfflineDB');
    this.version(1).stores({
      surveys: 'id, is_active',
      offline_submissions: 'id, survey_id, is_synced, client_created_at',
      analytics_cache: 'id, cached_at',
    });

    // Tự động seed câu hỏi ban đầu nếu IndexedDB trống
    this.on('populate', () => {
      this.surveys.add(DEFAULT_SURVEY);
    });
  }
}

export const db = new TrafficSurveyDexieDB();

// Đảm bảo dữ liệu mặc định luôn có sẵn
export async function ensureDefaultSurveySeeded(): Promise<Survey> {
  const existing = await db.surveys.get('survey-traffic-2026');
  if (!existing) {
    await db.surveys.put(DEFAULT_SURVEY);
    return DEFAULT_SURVEY;
  }
  return existing;
}
