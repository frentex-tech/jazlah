import { cn } from '@/lib/utils';

/** 16px ring spinner in the current text color (the Button loading state). */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-4 animate-spin rounded-pill border-2 border-current border-t-transparent', className)}
    />
  );
}
