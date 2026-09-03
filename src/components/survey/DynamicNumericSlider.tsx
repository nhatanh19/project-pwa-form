import React, { useState } from 'react';
import { Slider } from '../ui/slider';
import { Calculator, SlidersHorizontal, Plus, Minus } from 'lucide-react';
import { formatNumber, formatVND } from '../../lib/utils';
import { Button } from '../ui/button';

interface DynamicNumericSliderProps {
  value?: number;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  unit?: string | null;
  onChange: (val: number) => void;
}

export const DynamicNumericSlider: React.FC<DynamicNumericSliderProps> = ({
  value = 0,
  min = 0,
  max = 5000000,
  step = 50000,
  unit = 'VNĐ',
  onChange,
}) => {
  const safeMin = min ?? 0;
  const safeMax = max ?? 5000000;
  const safeStep = step ?? 1;
  const safeUnit = unit || '';

  const isVND = safeUnit.toUpperCase().includes('VN') || safeUnit.toUpperCase().includes('Đ');

  // Chế độ nhập bàn phím thủ công vs Kéo slider
  const [isManualInput, setIsManualInput] = useState<boolean>(false);

  // Sinh các mốc chọn nhanh dựa theo min và max
  const getPresets = () => {
    const range = safeMax - safeMin;
    if (range <= 0) return [];
    if (isVND) {
      return [
        { label: '100K', val: 100000 },
        { label: '300K', val: 300000 },
        { label: '500K', val: 500000 },
        { label: '1 Triệu', val: 1000000 },
        { label: '2 Triệu', val: 2000000 },
        { label: '3 Triệu', val: 3000000 },
      ].filter((p) => p.val >= safeMin && p.val <= safeMax);
    }
    // Đối với các đơn vị khác (km, phút, lượt)
    return [
      Math.round(safeMin + range * 0.2),
      Math.round(safeMin + range * 0.4),
      Math.round(safeMin + range * 0.6),
      Math.round(safeMin + range * 0.8),
      safeMax,
    ].map((val) => ({ label: `${val} ${safeUnit}`, val }));
  };

  const presets = getPresets();

  const handleStepAdjust = (multiplier: number) => {
    const nextVal = Math.min(safeMax, Math.max(safeMin, value + safeStep * multiplier));
    onChange(nextVal);
  };

  return (
    <div className="space-y-5 pt-1">
      {/* Visual Display Box */}
      <div className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-md">
        <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
          <span>Giá trị lựa chọn</span>
          {safeUnit && <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-200">{safeUnit}</span>}
        </div>

        {/* Large Formatted Number Display */}
        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white my-1">
          {isVND ? formatVND(value) : `${formatNumber(value)} ${safeUnit}`}
        </div>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setIsManualInput(!isManualInput)}
          className="mt-2 flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-white/20 transition-colors"
        >
          {isManualInput ? (
            <>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Chuyển sang kéo thanh trượt</span>
            </>
          ) : (
            <>
              <Calculator className="h-3.5 w-3.5" />
              <span>Nhập số chính xác</span>
            </>
          )}
        </button>
      </div>

      {/* Manual Input Mode vs Slider Mode */}
      {isManualInput ? (
        <div className="space-y-3 animate-fadeIn">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={value || ''}
              min={safeMin}
              max={safeMax}
              step={safeStep}
              onChange={(e) => {
                const num = parseFloat(e.target.value) || 0;
                onChange(Math.min(safeMax, Math.max(safeMin, num)));
              }}
              placeholder={`Nhập số lượng (${safeMin} - ${safeMax})`}
              className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 text-xl font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm"
            />
            {safeUnit && (
              <span className="absolute right-4 top-4 text-sm font-bold text-slate-400">
                {safeUnit}
              </span>
            )}
          </div>

          {/* Quick Increment buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleStepAdjust(-1)}
              className="h-11 rounded-xl text-xs font-bold gap-1"
            >
              <Minus className="h-3.5 w-3.5" />
              <span>Giảm {formatNumber(safeStep)} {safeUnit}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleStepAdjust(1)}
              className="h-11 rounded-xl text-xs font-bold gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tăng {formatNumber(safeStep)} {safeUnit}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-1">
          <Slider
            value={[value]}
            min={safeMin}
            max={safeMax}
            step={safeStep}
            onValueChange={(vals) => onChange(vals[0])}
            className="py-3"
          />

          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>{isVND ? formatVND(safeMin) : `${formatNumber(safeMin)} ${safeUnit}`}</span>
            <span>{isVND ? formatVND(safeMax) : `${formatNumber(safeMax)} ${safeUnit}`}</span>
          </div>
        </div>
      )}

      {/* Preset Quick Chips */}
      {presets.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-bold text-slate-500 mb-2">Chọn nhanh mốc phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                  value === preset.val
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
