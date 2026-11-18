import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Figma DS «Select» (16:1584): default, filled (ink-2 border), open (ember 2px), disabled. Native select for keyboard and RTL.
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, value, children, ...props },
  ref,
) {
  const filled = value !== undefined && value !== '';
  return (
    <span className={cn('relative inline-flex h-11 w-[191px]', className)}>
      <select
        ref={ref}
        value={value}
        className={cn(
          'peer size-full appearance-none rounded-sm border bg-paper ps-s12 pe-[36px] text-body-m outline-none',
          'focus:border-2 focus:border-ember disabled:border-line disabled:bg-sand disabled:text-muted-soft',
          filled ? 'border-ink-2 text-ink' : 'border-line text-ink-2',
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDown size={16} aria-hidden className="pointer-events-none absolute end-s12 top-1/2 -translate-y-1/2 text-ink-2 peer-disabled:text-muted-soft" />
    </span>
  );
});
