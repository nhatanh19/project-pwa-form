import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'border-transparent bg-slate-900 text-white',
    secondary: 'border-transparent bg-slate-100 text-slate-800',
    destructive: 'border-transparent bg-red-100 text-red-700',
    outline: 'border-slate-300 text-slate-700',
    success: 'border-transparent bg-emerald-100 text-emerald-800 font-semibold',
    warning: 'border-transparent bg-amber-100 text-amber-800 font-semibold',
  }[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
