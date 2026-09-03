import React from 'react';
import {
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  Footprints,
  Clock,
  Coins,
  Zap,
  ShieldCheck,
  Leaf,
  Navigation,
  Train,
} from 'lucide-react';

interface IconMatch {
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

export function resolveOptionIcon(text: string, index = 0): IconMatch {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Phương tiện di chuyển
  if (lower.includes('xe may') || lower.includes('motor') || lower.includes('scooter')) {
    return { icon: Bike, colorClass: 'text-blue-600', bgClass: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
  if (lower.includes('xe buyt') || lower.includes('bus') || lower.includes('cong cong')) {
    return { icon: Bus, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (lower.includes('xe dap') || lower.includes('di bo') || lower.includes('walk') || lower.includes('bike')) {
    return { icon: Footprints, colorClass: 'text-teal-600', bgClass: 'bg-teal-100 text-teal-700 border-teal-200' };
  }
  if (lower.includes('cong nghe') || lower.includes('taxi') || lower.includes('grab') || lower.includes('be') || lower.includes('xanh sm')) {
    return { icon: CarTaxiFront, colorClass: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  if (lower.includes('o to') || lower.includes('xe hoi') || lower.includes('car')) {
    return { icon: Car, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  if (lower.includes('tau') || lower.includes('metro') || lower.includes('train')) {
    return { icon: Train, colorClass: 'text-violet-600', bgClass: 'bg-violet-100 text-violet-700 border-violet-200' };
  }

  // 2. Lý do / Tiêu chí
  if (lower.includes('chi phi') || lower.includes('tien') || lower.includes('re') || lower.includes('cost')) {
    return { icon: Coins, colorClass: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  if (lower.includes('thoi gian') || lower.includes('nhanh') || lower.includes('time')) {
    return { icon: Clock, colorClass: 'text-blue-600', bgClass: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
  if (lower.includes('linh hoat') || lower.includes('tien loi') || lower.includes('chu dong')) {
    return { icon: Zap, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  }
  if (lower.includes('an toan') || lower.includes('mua nang') || lower.includes('suc khoe')) {
    return { icon: ShieldCheck, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (lower.includes('moi truong') || lower.includes('xanh') || lower.includes('eco')) {
    return { icon: Leaf, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }

  // 3. Cự ly / Khoảng cách
  if (lower.includes('km') || lower.includes('duoi') || lower.includes('tren') || lower.includes('khoang cach')) {
    return { icon: Navigation, colorClass: 'text-sky-600', bgClass: 'bg-sky-100 text-sky-700 border-sky-200' };
  }

  // Fallback avatar
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const letter = letters[index % letters.length];

  const LetterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span className={`font-black text-xs inline-flex items-center justify-center ${className || ''}`}>
      {letter}
    </span>
  );

  return {
    icon: LetterIcon,
    colorClass: 'text-slate-700',
    bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}
