import React from 'react';
import { CheckCircle2, Edit3, ShieldCheck, Sparkles } from 'lucide-react';
import { Question, AnswerItem } from '../../types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { formatNumber, formatVND } from '../../lib/utils';

interface SurveySummaryReviewProps {
  questions: Question[];
  answersState: Record<string, AnswerItem>;
  onEditStep: (questionIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const SurveySummaryReview: React.FC<SurveySummaryReviewProps> = ({
  questions,
  answersState,
  onEditStep,
  onSubmit,
  isSubmitting,
}) => {
  // Format câu trả lời để hiển thị tóm tắt
  const renderAnswerPreview = (q: Question) => {
    const ans = answersState[q.id];
    if (!ans) return <span className="text-slate-400 italic">Chưa trả lời</span>;

    if (q.question_type === 'SINGLE_CHOICE') {
      const opt = q.options?.find((o) => o.id === ans.option_id);
      return <span className="font-bold text-blue-900">{opt?.option_text || 'Chưa chọn'}</span>;
    }

    if (q.question_type === 'MULTIPLE_CHOICE') {
      const selectedOpts = q.options?.filter((o) => ans.selected_option_ids?.includes(o.id));
      if (!selectedOpts || selectedOpts.length === 0) {
        return <span className="text-slate-400 italic">Chưa chọn</span>;
      }
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {selectedOpts.map((opt) => (
            <span
              key={opt.id}
              className="rounded-lg bg-blue-100/70 text-blue-900 px-2 py-0.5 text-xs font-bold"
            >
              {opt.option_text}
            </span>
          ))}
        </div>
      );
    }

    if (q.question_type === 'NUMERIC') {
      const isVND = q.unit?.toUpperCase().includes('VN') || q.unit?.toUpperCase().includes('Đ');
      const val = ans.numeric_value ?? 0;
      return (
        <span className="font-black text-emerald-800">
          {isVND ? formatVND(val) : `${formatNumber(val)} ${q.unit || ''}`}
        </span>
      );
    }

    if (q.question_type === 'RATING') {
      const score = ans.numeric_value ?? 0;
      return (
        <span className="font-black text-amber-700 flex items-center gap-1">
          {score} ⭐ / {q.max_val ?? 5}
        </span>
      );
    }

    if (q.question_type === 'TEXT' || q.question_type === 'TEXTAREA') {
      return (
        <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-xl mt-1">
          "{ans.text_value || 'Không có ý kiến'}"
        </p>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Summary Header */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center space-x-2 text-blue-800">
            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
            <CardTitle className="text-base font-extrabold text-blue-950">
              Kiểm Tra Lại Phiếu Khảo Sát
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-blue-700 mt-1">
            Vui lòng rà soát lại thông tin trước khi lưu vào cơ sở dữ liệu
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Questions Review List */}
      <div className="space-y-2.5">
        {questions.map((q, idx) => (
          <Card key={q.id} className="border-slate-200/90 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-3.5 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                    Câu {idx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">
                    {q.question_text}
                  </p>
                </div>
                <div className="text-xs pl-0.5">{renderAnswerPreview(q)}</div>
              </div>

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => onEditStep(idx)}
                className="flex items-center space-x-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 shrink-0 transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>Sửa</span>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Action Box */}
      <div className="rounded-3xl bg-slate-900 p-5 text-white space-y-3 shadow-lg shadow-slate-900/15">
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Tự động lưu Offline & Đồng bộ ngay khi có mạng</span>
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-md gap-2"
        >
          {isSubmitting ? (
            <span>Đang ghi nhận phiếu...</span>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Xác Nhận & Nộp Phiếu Khảo Sát</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
