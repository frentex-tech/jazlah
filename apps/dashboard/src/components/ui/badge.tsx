import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Figma DS «Badge» (16:739): status badges, type × size M/S, with a leading dot.
const badge = cva('inline-flex shrink-0 items-center justify-center gap-[6px] whitespace-nowrap rounded-pill', {
  variants: {
    type: {
      neutral: 'bg-sand text-ink-2 [--dot:theme(colors.muted)]',
      info: 'bg-info-bg text-info [--dot:theme(colors.info)]',
      warning: 'bg-warning-bg text-warning [--dot:theme(colors.warning)]',
      success: 'bg-success-bg text-success-text [--dot:theme(colors.success)]',
      danger: 'bg-danger-bg text-danger [--dot:theme(colors.danger)]',
      brand: 'bg-gold-bg text-gold-text [--dot:theme(colors.gold)]',
    },
    size: { M: 'h-7 px-s12 text-label-m', S: 'h-[22px] px-s8 text-caption' },
  },
  defaultVariants: { type: 'neutral', size: 'S' },
});

export type BadgeType = NonNullable<VariantProps<typeof badge>['type']>;

export function Badge({ type, size, className, children }: VariantProps<typeof badge> & { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn(badge({ type, size }), className)}>
      <span aria-hidden className="size-2 rounded-pill bg-[var(--dot)]" />
      {children}
    </span>
  );
}
