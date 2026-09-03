import React from 'react';
import { Check } from 'lucide-react';
import { Option } from '../../types/survey';
import { cn } from '../../lib/utils';

interface SingleChoiceProps {
  options: Option[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export const SingleChoice: React.FC<SingleChoiceProps> = ({
  options,
  selectedOptionId,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const isSelected = selectedOptionId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              'group relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 touch-manipulation select-none active:scale-[0.98]',
              isSelected
                ? 'border-blue-600 bg-blue-50/60 shadow-sm text-blue-950 font-semibold ring-1 ring-blue-600'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <span className="text-base font-medium pr-4">{opt.option_text}</span>
            
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white'
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
