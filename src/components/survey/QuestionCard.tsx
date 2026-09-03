import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Question } from '../../types/survey';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalCount: number;
  errorMessage?: string | null;
  children: React.ReactNode;
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: 'Chọn 1 phương án',
  MULTIPLE_CHOICE: 'Chọn nhiều phương án',
  NUMERIC: 'Nhập số liệu / Kéo trượt',
  RATING: 'Đánh giá mức độ',
  TEXT: 'Ý kiến ngắn',
  TEXTAREA: 'Ý kiến chi tiết',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalCount,
  errorMessage,
  children,
}) => {
  const typeLabel = TYPE_LABELS[question.question_type] || 'Trả lời câu hỏi';

  return (
    <Card className="border-slate-200/90 bg-white shadow-lg shadow-slate-900/5 rounded-3xl overflow-hidden transition-all">
      {/* Header Container */}
      <CardHeader className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge
            variant="secondary"
            className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 bg-blue-50 text-blue-700 border-blue-100"
          >
            Câu {currentIndex + 1} / {totalCount}
          </Badge>

          <span className="text-[11px] font-semibold text-slate-500">
            {typeLabel}
          </span>
        </div>

        {/* Question Text (Large, crisp, responsive) */}
        <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
          {question.question_text}
          {question.is_required === 1 && (
            <span className="text-red-500 ml-1" title="Bắt buộc">*</span>
          )}
        </CardTitle>

        {/* Optional Subtitle / Helper text */}
        {question.description && (
          <div className="flex items-start space-x-1.5 pt-1 text-xs text-slate-500 leading-relaxed">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{question.description}</span>
          </div>
        )}

        {/* Inline Validation Error */}
        {errorMessage && (
          <div className="mt-2.5 flex items-center space-x-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}
      </CardHeader>

      {/* Interactive Form Input Area */}
      <CardContent className="p-5 pt-5">
        {children}
      </CardContent>
    </Card>
  );
};
