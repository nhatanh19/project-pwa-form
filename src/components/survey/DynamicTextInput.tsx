import React from 'react';
import { MessageSquare } from 'lucide-react';

interface DynamicTextInputProps {
  value?: string;
  isTextArea?: boolean;
  placeholder?: string | null;
  onChange: (val: string) => void;
}

export const DynamicTextInput: React.FC<DynamicTextInputProps> = ({
  value = '',
  isTextArea = false,
  placeholder = 'Nhập câu trả lời của bạn...',
  onChange,
}) => {
  return (
    <div className="space-y-3 pt-1">
      <div className="relative">
        {isTextArea ? (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Nhập ý kiến, ghi chú thực địa...'}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-base text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm transition-colors resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Nhập câu trả lời ngắn...'}
            className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm transition-colors"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          Phản hồi định dạng văn bản
        </span>
        <span>{value.length} ký tự</span>
      </div>
    </div>
  );
};
