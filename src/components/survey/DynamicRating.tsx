import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DynamicRatingProps {
  value?: number;
  min?: number | null;
  max?: number | null;
  unit?: string | null;
  onChange: (val: number) => void;
}

const RATING_5_DESCRIPTIONS: Record<number, { text: string; color: string; bg: string }> = {
  1: { text: '1 ⭐ - Hoàn toàn không sẵn sàng', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  2: { text: '2 ⭐ - Còn nhiều băn khoăn / Chưa sẵn sàng', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  3: { text: '3 ⭐ - Trung lập / Cần cân nhắc thêm', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  4: { text: '4 ⭐ - Sẵn sàng ủng hộ & chuyển đổi', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  5: { text: '5 ⭐ - Rất sẵn sàng / Ủng hộ mạnh mẽ', color: 'text-emerald-800 font-extrabold', bg: 'bg-emerald-100 border-emerald-300' },
};

export const DynamicRating: React.FC<DynamicRatingProps> = ({
  value = 3,
  min = 1,
  max = 5,
  onChange,
}) => {
  const safeMin = min ?? 1;
  const safeMax = max ?? 5;
  const totalSteps = safeMax - safeMin + 1;
  const isFiveStar = safeMin === 1 && safeMax === 5;

  const currentDesc = isFiveStar && RATING_5_DESCRIPTIONS[value]
    ? RATING_5_DESCRIPTIONS[value]
    : {
        text: `Mức đánh giá: ${value} / ${safeMax}`,
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-200',
      };

  return (
    <div className="space-y-5 pt-1">
      {/* 1. Five Star Layout - Perfectly Centered & Responsive */}
      {isFiveStar ? (
        <div className="w-full max-w-[280px] mx-auto py-2">
          <div className="flex items-center justify-between">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
              const isFilled = star <= value;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star)}
                  className="group flex flex-col items-center p-1 transition-transform duration-150 active:scale-125 touch-manipulation focus:outline-none"
                >
                  <Star
                    className={cn(
                      'h-10 w-10 sm:h-11 sm:w-11 transition-all duration-200',
                      isFilled
                        ? 'fill-amber-400 text-amber-500 filter drop-shadow-md'
                        : 'text-slate-200 group-hover:text-amber-200'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[11px] font-black mt-1.5 transition-colors',
                      isFilled ? 'text-amber-600' : 'text-slate-400'
                    )}
                  >
                    {star}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 py-2">
          {Array.from({ length: totalSteps }, (_, i) => safeMin + i).map((num) => {
            const isSelected = num === value;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  'h-12 rounded-2xl border-2 font-black text-base transition-all active:scale-95 touch-manipulation',
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                {num}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Sentiment Description Card (No awkward text wrapping) */}
      <div className={cn('rounded-2xl p-3.5 border text-center transition-all shadow-xs', currentDesc.bg)}>
        <div className={cn('text-xs sm:text-sm font-bold leading-snug', currentDesc.color)}>
          {currentDesc.text}
        </div>
      </div>
    </div>
  );
};
