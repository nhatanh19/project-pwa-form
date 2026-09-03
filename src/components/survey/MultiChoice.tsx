import React from 'react';
import { Check } from 'lucide-react';
import { Option } from '../../types/survey';
import { cn } from '../../lib/utils';

interface MultiChoiceProps {
  options: Option[];
  selectedOptionIds: string[];
  onChange: (optionIds: string[]) => void;
}

export const MultiChoice: React.FC<MultiChoiceProps> = ({
  options,
  selectedOptionIds = [],
  onChange,
}) => {
  const handleToggle = (optionId: string) => {
    if (selectedOptionIds.includes(optionId)) {
      onChange(selectedOptionIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedOptionIds, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        * Có thể chọn nhiều đáp án
      </p>
      {options.map((opt) => {
        const isSelected = selectedOptionIds.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleToggle(opt.id)}
            className={cn(
              'group relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 touch-manipulation select-none active:scale-[0.98]',
              isSelected
                ? 'border-emerald-600 bg-emerald-50/60 shadow-sm text-emerald-950 font-semibold ring-1 ring-emerald-600'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <span className="text-base font-medium pr-4">{opt.option_text}</span>
            
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all',
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              )}
            >
              {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
