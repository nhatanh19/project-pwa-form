import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'emerald';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const variantStyles = {
      default: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
      outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]',
      ghost: 'hover:bg-slate-100 hover:text-slate-900',
      link: 'text-primary underline-offset-4 hover:underline',
      emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]',
    }[variant];

    const sizeStyles = {
      default: 'h-11 px-4 py-2 text-sm',
      sm: 'h-9 rounded-lg px-3 text-xs',
      lg: 'h-13 rounded-xl px-8 text-base font-semibold',
      xl: 'h-14 rounded-2xl px-8 text-lg font-bold',
      icon: 'h-10 w-10',
    }[size];

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none',
          variantStyles,
          sizeStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
