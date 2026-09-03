-- ============================================================================
-- Seed Data: Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày
-- ============================================================================

-- 1. Thêm Chiến dịch khảo sát
INSERT OR REPLACE INTO surveys (id, title, description, is_active)
VALUES (
    'survey-traffic-2026',
    'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
    'Khảo sát thực địa phục vụ nghiên cứu và đánh giá xu hướng chuyển đổi phương tiện giao thông cá nhân sang giao thông công cộng & xe điện.',
    1
);

-- 2. Thêm Danh sách câu hỏi (5 câu hỏi chuẩn)
-- Câu 1: Phương tiện di chuyển chính hàng ngày (Single choice)
INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, question_type, is_required)
VALUES (
    'q_transport_mode',
    'survey-traffic-2026',
    1,
    'Phương tiện di chuyển chính hàng ngày của bạn là gì?',
    'SINGLE_CHOICE',
    1
);

-- Options cho Câu 1
INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES
('opt_trans_motorbike', 'q_transport_mode', 'Xe máy cá nhân', 1),
('opt_trans_bus',       'q_transport_mode', 'Xe buýt công cộng', 2),
('opt_trans_bike_walk', 'q_transport_mode', 'Xe đạp / Đi bộ', 3),
('opt_trans_ride_hail', 'q_transport_mode', 'Xe công nghệ / Taxi', 4),
('opt_trans_car',       'q_transport_mode', 'Ô tô cá nhân', 5);

-- Câu 2: Quãng đường di chuyển trung bình mỗi ngày (Single choice)
INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, question_type, is_required)
VALUES (
    'q_daily_distance',
    'survey-traffic-2026',
    2,
    'Quãng đường di chuyển trung bình mỗi ngày của bạn?',
    'SINGLE_CHOICE',
    1
);

-- Options cho Câu 2
INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES
('opt_dist_under_3km', 'q_daily_distance', 'Dưới 3km', 1),
('opt_dist_3_7km',     'q_daily_distance', '3 - 7km', 2),
('opt_dist_7_15km',    'q_daily_distance', '7 - 15km', 3),
('opt_dist_over_15km', 'q_daily_distance', 'Trên 15km', 4);

-- Câu 3: Chi phí xăng xe/vé xe ước tính mỗi tháng (Numeric Slider/Input)
INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, question_type, is_required, min_val, max_val, step_val, unit)
VALUES (
    'q_monthly_cost',
    'survey-traffic-2026',
    3,
    'Chi phí xăng xe / vé xe ước tính mỗi tháng của bạn (VNĐ)?',
    'NUMERIC',
    1,
    0,
    5000000,
    50000,
    'VNĐ'
);

-- Câu 4: Lý do chính ưu tiên phương tiện hiện tại (Multiple choices)
INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, question_type, is_required)
VALUES (
    'q_reasons',
    'survey-traffic-2026',
    4,
    'Lý do chính bạn ưu tiên sử dụng phương tiện hiện tại?',
    'MULTIPLE_CHOICE',
    1
);

-- Options cho Câu 4
INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES
('opt_reason_cost',        'q_reasons', 'Tiết kiệm chi phí', 1),
('opt_reason_time',        'q_reasons', 'Tiết kiệm thời gian', 2),
('opt_reason_flexibility', 'q_reasons', 'Tiện lợi / Linh hoạt', 3),
('opt_reason_safety',      'q_reasons', 'An toàn / Tránh mưa nắng', 4);

-- Câu 5: Mức độ sẵn sàng chuyển sang phương tiện xanh (Rating scale 1-5 sao)
INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, question_type, is_required, min_val, max_val, step_val, unit)
VALUES (
    'q_green_readiness',
    'survey-traffic-2026',
    5,
    'Mức độ sẵn sàng chuyển sang phương tiện xanh (Xe điện / Xe buýt điện)?',
    'RATING',
    1,
    1,
    5,
    1,
    'Sao'
);
