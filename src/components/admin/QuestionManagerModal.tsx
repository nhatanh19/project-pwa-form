import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Layers,
} from 'lucide-react';
import { Question, QuestionType, Option } from '../../types/survey';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { db, DEFAULT_SURVEY } from '../../db/dexie';

interface QuestionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onRefreshQuestions: () => void;
  isOnline: boolean;
}

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  onClose,
  questions = [],
  onRefreshQuestions,
  isOnline,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');

  // Form State tạo mới
  const [questionText, setQuestionText] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('SINGLE_CHOICE');
  const [isRequired, setIsRequired] = useState<boolean>(true);

  // Options state cho Choice
  const [options, setOptions] = useState<{ option_text: string; description?: string }[]>([
    { option_text: 'Phương án 1' },
    { option_text: 'Phương án 2' },
  ]);

  // Numeric / Rating state
  const [minVal, setMinVal] = useState<number>(0);
  const [maxVal, setMaxVal] = useState<number>(5000000);
  const [stepVal, setStepVal] = useState<number>(50000);
  const [unit, setUnit] = useState<string>('VNĐ');
  const [placeholder, setPlaceholder] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { option_text: `Phương án ${prev.length + 1}` }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, text: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index].option_text = text;
      return updated;
    });
  };

  // Submit tạo mới câu hỏi
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setStatusMessage({ text: 'Vui lòng nhập nội dung câu hỏi', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const newQuestionId = `q_${Date.now()}`;
    const nextOrder = questions.length + 1;

    // Chuẩn bị payload options
    const formattedOptions: Option[] =
      questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE'
        ? options
            .filter((o) => o.option_text.trim().length > 0)
            .map((o, idx) => ({
              id: `opt_${Date.now()}_${idx + 1}`,
              question_id: newQuestionId,
              option_text: o.option_text.trim(),
              order_num: idx + 1,
            }))
        : [];

    const newQuestion: Question = {
      id: newQuestionId,
      survey_id: 'survey-traffic-2026',
      order_num: nextOrder,
      question_text: questionText.trim(),
      description: description.trim() || undefined,
      question_type: questionType,
      is_required: isRequired ? 1 : 0,
      min_val: questionType === 'NUMERIC' || questionType === 'RATING' ? minVal : undefined,
      max_val: questionType === 'NUMERIC' || questionType === 'RATING' ? maxVal : undefined,
      step_val: questionType === 'NUMERIC' ? stepVal : 1,
      unit: questionType === 'NUMERIC' || questionType === 'RATING' ? unit : undefined,
      placeholder: placeholder.trim() || undefined,
      options: formattedOptions,
    };

    try {
      // 1. Cập nhật cache IndexedDB tức thì
      const currentSurvey = (await db.surveys.get('survey-traffic-2026')) || DEFAULT_SURVEY;
      const currentQuestions = currentSurvey.questions || [];
      const updatedQuestions = [...currentQuestions, newQuestion];
      await db.surveys.put({ ...currentSurvey, questions: updatedQuestions });

      // 2. Gửi lên Server D1 nếu Online
      if (isOnline) {
        try {
          const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newQuestion.id,
              survey_id: 'survey-traffic-2026',
              question_text: newQuestion.question_text,
              description: newQuestion.description,
              question_type: newQuestion.question_type,
              is_required: newQuestion.is_required,
              min_val: newQuestion.min_val,
              max_val: newQuestion.max_val,
              step_val: newQuestion.step_val,
              unit: newQuestion.unit,
              placeholder: newQuestion.placeholder,
              options: formattedOptions.map((o) => ({ option_text: o.option_text })),
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: 'Lỗi server' }));
            console.warn('Lưu câu hỏi trên server có thông báo:', err);
          }
        } catch (serverErr) {
          console.warn('Không thể gửi API lên server:', serverErr);
        }
      }

      setStatusMessage({ text: 'Đã thêm câu hỏi vào bộ khảo sát thành công!', isError: false });
      onRefreshQuestions();

      // Reset form & chuyển tab
      setTimeout(() => {
        setQuestionText('');
        setDescription('');
        setActiveTab('LIST');
        setStatusMessage(null);
      }, 600);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi tạo câu hỏi';
      setStatusMessage({ text: errorMsg, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;

    try {
      // 1. Xóa trong IndexedDB
      const currentSurvey = (await db.surveys.get('survey-traffic-2026')) || DEFAULT_SURVEY;
      const updated = (currentSurvey.questions || []).filter((q) => q.id !== qId);
      await db.surveys.put({ ...currentSurvey, questions: updated });

      // 2. Xóa trên server nếu Online
      if (isOnline) {
        try {
          await fetch(`/api/questions/${qId}`, { method: 'DELETE' });
        } catch (serverErr) {
          console.warn('Không thể gửi lệnh xóa lên server:', serverErr);
        }
      }

      onRefreshQuestions();
    } catch {
      alert('Không thể xóa câu hỏi lúc này');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-black tracking-tight">Cấu Hình Danh Mục Câu Hỏi</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'LIST'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="inline h-3.5 w-3.5 mr-1" />
            Danh sách ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREATE')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'CREATE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" />
            Thêm câu hỏi mới
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
                statusMessage.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: DANH SÁCH CÂU HỎI */}
          {activeTab === 'LIST' && (
            <div className="space-y-2.5">
              {questions.map((q, idx) => (
                <Card key={q.id} className="border-slate-200 bg-white shadow-xs rounded-2xl">
                  <CardContent className="p-3.5 flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <Badge variant="outline" className="text-[10px] font-black px-1.5 py-0.2">
                          Câu {idx + 1}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {q.question_type}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {q.question_text}
                      </p>
                      {q.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          {q.description}
                        </p>
                      )}
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 2: FORM TẠO MỚI CÂU HỎI */}
          {activeTab === 'CREATE' && (
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {/* Tiêu đề câu hỏi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Vd: Bạn có dự định chuyển sang xe điện trong tương lai không?"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Phụ đề / Hướng dẫn */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Phụ đề / Hướng dẫn trả lời (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vd: Chọn 1 phương án phù hợp nhất với kế hoạch của bạn."
                  className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Loại câu hỏi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Loại câu hỏi</label>
                <select
                  value={questionType}
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType;
                    setQuestionType(newType);
                    if (newType === 'RATING') {
                      setMinVal(1);
                      setMaxVal(5);
                      setUnit('Sao');
                    } else if (newType === 'NUMERIC') {
                      setMinVal(0);
                      setMaxVal(5000000);
                      setStepVal(50000);
                      setUnit('VNĐ');
                    }
                  }}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-xs font-bold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="SINGLE_CHOICE">Trắc nghiệm 1 lựa chọn (Single Choice)</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều lựa chọn (Multiple Choice)</option>
                  <option value="NUMERIC">Số liệu / Thanh trượt (Numeric Slider)</option>
                  <option value="RATING">Đánh giá mức độ / Sao (Rating)</option>
                  <option value="TEXT">Ý kiến ngắn (Short Text)</option>
                  <option value="TEXTAREA">Ý kiến chi tiết (Long Textarea)</option>
                </select>
              </div>

              {/* Bắt buộc trả lời? */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isRequired" className="text-xs font-bold text-slate-700">
                  Bắt buộc trả lời trước khi Next
                </label>
              </div>

              {/* Cấu hình danh sách Options (Choice) */}
              {(questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Các phương án lựa chọn:</label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      + Thêm phương án
                    </button>
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-400 w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          required
                          value={opt.option_text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Lựa chọn ${idx + 1}`}
                          className="flex-1 h-9 rounded-xl border border-slate-300 px-3 text-xs focus:border-blue-600 focus:outline-none"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cấu hình Numeric / Slider */}
              {questionType === 'NUMERIC' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Tối thiểu</label>
                    <input
                      type="number"
                      value={minVal}
                      onChange={(e) => setMinVal(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Tối đa</label>
                    <input
                      type="number"
                      value={maxVal}
                      onChange={(e) => setMaxVal(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Bước nhảy</label>
                    <input
                      type="number"
                      value={stepVal}
                      onChange={(e) => setStepVal(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Đơn vị (vd: VNĐ, km)</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Cấu hình Rating */}
              {questionType === 'RATING' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Thang điểm tối đa</label>
                    <select
                      value={maxVal}
                      onChange={(e) => setMaxVal(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs font-bold"
                    >
                      <option value={5}>5 Sao (Phổ biến)</option>
                      <option value={10}>10 Điểm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Đơn vị hiển thị</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-300 px-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Cấu hình Text / Textarea */}
              {(questionType === 'TEXT' || questionType === 'TEXTAREA') && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-600">Gợi ý nhập liệu (Placeholder)</label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="Vd: Nhập ý kiến đóng góp của bạn..."
                    className="w-full h-9 rounded-xl border border-slate-300 px-3 text-xs"
                  />
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
                >
                  {isSubmitting ? 'Đang tạo câu hỏi...' : '+ Lưu & Đưa Vào Khảo Sát'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
