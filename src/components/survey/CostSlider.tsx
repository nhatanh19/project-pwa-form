import React from 'react';
import { Slider } from '../ui/slider';
import { formatVND } from '../../lib/utils';
import { Coins } from 'lucide-react';

interface CostSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

const QUICK_PRESETS = [
  { label: '100K', value: 100000 },
  { label: '300K', value: 300000 },
  { label: '500K', value: 500000 },
  { label: '1 Triệu', value: 1000000 },
  { label: '2 Triệu', value: 2000000 },
];

export const CostSlider: React.FC<CostSliderProps> = ({
  value,
  min = 0,
  max = 5000000,
  step = 50000,
  onChange,
}) => {
  return (
    <div className="space-y-6 pt-2">
      {/* Visual Value Display */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 border border-blue-100/80 shadow-inner">
        <div className="flex items-center space-x-2 text-blue-700 mb-1">
          <Coins className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Ước tính hàng tháng</span>
        </div>
        <div className="text-3xl font-extrabold text-blue-950 tracking-tight">
          {formatVND(value)}
        </div>
      </div>

      {/* Slider Control */}
      <div className="px-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0])}
        />
        <div className="flex justify-between text-xs font-medium text-slate-400 mt-2">
          <span>{formatVND(min)}</span>
          <span>{formatVND(max)}</span>
        </div>
      </div>

      {/* Quick preset chips */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">Chọn nhanh:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                value === preset.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
