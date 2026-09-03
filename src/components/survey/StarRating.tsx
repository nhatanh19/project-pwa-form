import React from 'react';
import { Star, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  onChange: (val: number) => void;
}

const RATING_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: '1 Sao', desc: 'Hoàn toàn không sẵn sàng', color: 'text-red-500' },
  2: { label: '2 Sao', desc: 'Còn nhiều băn khoăn / Ít sẵn sàng', color: 'text-amber-500' },
  3: { label: '3 Sao', desc: 'Trung lập / Cân nhắc khi có trạm sạc', color: 'text-yellow-500' },
  4: { label: '4 Sao', desc: 'Sẵn sàng chuyển đổi', color: 'text-emerald-500' },
  5: { label: '5 Sao', desc: 'Rất sẵn sàng / Ủng hộ mạnh mẽ xe xanh', color: 'text-emerald-600' },
};

export const StarRating: React.FC<StarRatingProps> = ({
  value = 3,
  max = 5,
  onChange,
}) => {
  const currentInfo = RATING_LABELS[value] || RATING_LABELS[3];

  return (
    <div className="space-y-6 pt-2">
      {/* Eco Badge info */}
      <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 text-emerald-800 text-xs font-medium border border-emerald-100">
        <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Xe máy điện, ô tô điện, xe buýt điện VinBus / Metro...</span>
      </div>

      {/* Interactive Stars Row */}
      <div className="flex items-center justify-center space-x-3 py-4">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
          const isFilled = star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="group p-1 transition-transform duration-150 active:scale-125 touch-manipulation focus:outline-none"
            >
              <Star
                className={cn(
                  'h-12 w-12 transition-all duration-200',
                  isFilled
                    ? 'fill-amber-400 text-amber-500 filter drop-shadow-sm'
                    : 'text-slate-300 group-hover:text-amber-200'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Rating Label and Description */}
      <div className="text-center rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <div className={cn('text-lg font-bold', currentInfo.color)}>
          {currentInfo.label} - {currentInfo.desc}
        </div>
      </div>
    </div>
  );
};
