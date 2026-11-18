import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

// Figma DS «Button» (16:215): variant × state (default, pressed = :active, disabled, loading) × size L/S.
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-s8 whitespace-nowrap border border-transparent transition-colors disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-ember text-paper active:bg-ember-2 disabled:bg-sand disabled:text-muted-soft',
        secondary: 'border-ember bg-paper text-ember active:bg-sand disabled:border-line disabled:text-muted-soft',
        ghost: 'text-ember active:bg-sand disabled:text-muted-soft',
        danger: 'bg-danger text-paper active:bg-danger-pressed disabled:bg-sand disabled:text-muted-soft',
      },
      size: {
        L: 'h-[52px] rounded-md px-s24 text-h3',
        S: 'h-9 rounded-sm px-s16 text-label-m',
      },
    },
    defaultVariants: { variant: 'primary', size: 'L' },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant, size, loading, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), loading && 'pointer-events-none', className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
});
