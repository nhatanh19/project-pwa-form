export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'NUMERIC'
  | 'RATING'
  | 'TEXT'
  | 'TEXTAREA';

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  description?: string;        // Phụ đề mô tả tùy chọn
  order_num: number;
  icon_name?: string;
}

export interface Question {
  id: string;
  survey_id: string;
  order_num: number;
  question_text: string;
  description?: string;        // Phụ đề / hướng dẫn trả lời cho câu hỏi
  question_type: QuestionType;
  is_required: number;         // 1: Bắt buộc, 0: Tùy chọn
  min_val?: number | null;     // Giá trị nhỏ nhất (cho numeric / rating)
  max_val?: number | null;     // Giá trị lớn nhất (cho numeric / rating)
  step_val?: number | null;    // Bước nhảy (cho numeric)
  unit?: string | null;        // Đơn vị đo (vd: 'VNĐ', 'km', 'phút', 'sao', 'lượt')
  placeholder?: string | null; // Gợi ý nhập liệu cho Text input
  options?: Option[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  is_active: number;
  questions: Question[];
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error?: string | null;
}

export interface AnswerItem {
  question_id: string;
  option_id?: string;             // Dùng cho SINGLE_CHOICE
  selected_option_ids?: string[]; // Danh sách ID cho MULTIPLE_CHOICE
  numeric_value?: number;         // Dùng cho NUMERIC / RATING
  text_value?: string;            // Dùng cho TEXT / TEXTAREA
}

export interface SurveySubmission {
  id: string;                     // Client UUID v4
  survey_id: string;
  enumerator_id?: string;
  client_created_at: string;      // ISO string khi bắt đầu làm bài
  completed_at?: string;          // ISO string khi hoàn thành nộp bài
  survey_duration_seconds?: number; // Thời gian làm bài tính theo giây
  location?: LocationData;        // Tọa độ GPS thực địa
  photo_data?: string | null;     // Ảnh chụp khu vực khảo sát (Base64 Data URL)
  answers: AnswerItem[];
  device_info?: string;
}
