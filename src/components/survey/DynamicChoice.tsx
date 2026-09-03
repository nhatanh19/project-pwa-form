import React from 'react';
import { Check } from 'lucide-react';
import { Option } from '../../types/survey';
import { resolveOptionIcon } from '../../lib/icon-resolver';
import { cn } from '../../lib/utils';

interface DynamicChoiceProps {
  options: Option[];
  isMultiple: boolean;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  onSingleSelect?: (optId: string) => void;
  onMultiSelect?: (optIds: string[]) => void;
}

export const DynamicChoice: React.FC<DynamicChoiceProps> = ({
  options = [],
  isMultiple,
  selectedOptionId,
  selectedOptionIds = [],
  onSingleSelect,
  onMultiSelect,
}) => {
  const handleToggleMulti = (optId: string) => {
    if (!onMultiSelect) return;
    if (selectedOptionIds.includes(optId)) {
      onMultiSelect(selectedOptionIds.filter((id) => id !== optId));
    } else {
      onMultiSelect([...selectedOptionIds, optId]);
    }
  };

  return (
    <div className="space-y-3">
      {isMultiple && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1 px-1">
          <span>Chọn tất cả các phương án phù hợp:</span>
          <span className="text-blue-600 font-bold">
            Đã chọn: {selectedOptionIds.length}
          </span>
        </div>
      )}

      {options.map((opt, index) => {
        const isSelected = isMultiple
          ? selectedOptionIds.includes(opt.id)
          : selectedOptionId === opt.id;

        const { icon: IconComp, colorClass, bgClass } = resolveOptionIcon(opt.option_text, index);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              if (isMultiple) {
                handleToggleMulti(opt.id);
              } else if (onSingleSelect) {
                onSingleSelect(opt.id);
              }
            }}
            className={cn(
              'group relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 touch-manipulation select-none active:scale-[0.98]',
              isSelected
                ? 'border-blue-600 bg-blue-50/70 shadow-md shadow-blue-600/5 text-blue-950 ring-2 ring-blue-600/30 font-semibold'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/80'
            )}
          >
            {/* Left: Icon & Text Container */}
            <div className="flex items-center space-x-3.5 pr-3 min-w-0">
              {/* Semantic Icon Badge */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105',
                  isSelected ? 'bg-blue-600 text-white border-blue-600' : bgClass
                )}
              >
                <IconComp className={cn('h-5 w-5', isSelected ? 'text-white' : colorClass)} />
              </div>

              {/* Text & Optional Description */}
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {opt.option_text}
                </p>
                {opt.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 font-normal">
                    {opt.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Check indicator */}
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                isMultiple ? 'rounded-lg' : 'rounded-full',
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
