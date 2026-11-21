import { cn } from '@/lib/utils';

/** Sand placeholder bar used by every loading state in the Figma file («loading sk», radius 18). */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden style={style} className={cn('block h-3 animate-pulse rounded-md bg-sand', className)} />;
}
