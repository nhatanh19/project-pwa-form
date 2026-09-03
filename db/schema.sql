-- ============================================================================
-- Cloudflare D1 SQLite Database Schema
-- Survey System for Field Enumerators (Offline-First Ready)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Bảng lưu trữ thông tin chiến dịch khảo sát
CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,                       -- UUID hoặc mã định danh (vd: 'survey-traffic-2026')
    title TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,      -- 1: Đang hoạt động, 0: Tạm ngưng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng lưu danh sách câu hỏi trong khảo sát
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,                       -- UUID hoặc mã câu hỏi (vd: 'q_transport_mode')
    survey_id TEXT NOT NULL,
    order_num INTEGER NOT NULL,                -- Thứ tự hiển thị câu hỏi (1, 2, 3...)
    question_text TEXT NOT NULL,
    description TEXT,                          -- Phụ đề / Hướng dẫn trả lời
    question_type TEXT NOT NULL CHECK (
        question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERIC', 'RATING', 'TEXT', 'TEXTAREA')
    ),
    is_required INTEGER NOT NULL DEFAULT 1,    -- 1: Bắt buộc, 0: Tùy chọn
    min_val REAL,                              -- Giá trị tối thiểu (cho slider / rating)
    max_val REAL,                              -- Giá trị tối đa (cho slider / rating)
    step_val REAL DEFAULT 1,                   -- Bước nhảy
    unit TEXT,                                 -- Đơn vị đo (vd: 'VNĐ', 'km', 'sao')
    placeholder TEXT,                          -- Gợi ý nhập liệu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 3. Bảng lưu trữ các tùy chọn trả lời (cho Single Choice / Multiple Choice)
CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,                       -- UUID hoặc mã tùy chọn (vd: 'opt_motorbike')
    question_id TEXT NOT NULL,
    option_text TEXT NOT NULL,
    description TEXT,                          -- Phụ đề mô tả tùy chọn
    order_num INTEGER NOT NULL DEFAULT 1,      -- Thứ tự lựa chọn trong danh sách
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 4. Bảng lưu trữ mỗi lượt nộp phiếu khảo sát (Response / Submission)
-- Bổ sung GPS Geolocation và Thời lượng khảo sát
CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,                       -- Client-generated UUID v4
    survey_id TEXT NOT NULL,
    enumerator_id TEXT,                        -- Mã nhân viên khảo sát (nếu có)
    client_created_at TIMESTAMP NOT NULL,      -- Thời điểm bắt đầu thực hiện bài khảo sát
    completed_at TIMESTAMP,                    -- Thời điểm hoàn thành bấm nộp phiếu
    survey_duration_seconds INTEGER,           -- Thời lượng làm bài tính theo giây
    latitude REAL,                             -- Tọa độ GPS Vĩ độ (Latitude)
    longitude REAL,                            -- Tọa độ GPS Kinh độ (Longitude)
    accuracy REAL,                             -- Độ chính xác GPS (bán kính mét)
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm dữ liệu được sync về server
    device_info TEXT,                          -- Thông tin thiết bị
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 5. Bảng lưu trữ từng câu trả lời chi tiết (Answers)
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,                       -- Client-generated UUID v4
    response_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    option_id TEXT,                            -- Khóa ngoại tới bảng options (nếu là câu hỏi trắc nghiệm)
    numeric_value REAL,                        -- Lưu số tiền (VNĐ), số sao đánh giá (1-5), hoặc cự ly
    text_value TEXT,                           -- Lưu phản hồi text mở rộng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE SET NULL
);

-- Indexes tối ưu hóa
CREATE INDEX IF NOT EXISTS idx_questions_survey_order ON questions(survey_id, order_num);
CREATE INDEX IF NOT EXISTS idx_options_question_order ON options(question_id, order_num);
CREATE INDEX IF NOT EXISTS idx_responses_survey_created ON responses(survey_id, client_created_at);
CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_option ON answers(question_id, option_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_numeric ON answers(question_id, numeric_value);
