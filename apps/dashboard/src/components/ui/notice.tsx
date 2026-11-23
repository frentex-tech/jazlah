import { WarningCircle, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// The page notices of the catalog frames: warning (131:25074, warning-bg) or sand (131:38234), r18, 12/16 padding,
// a 24 icon then a Body/M line; `children` may add an action after the text.
export function Notice({ tone = 'warning', icon: IconCmp = WarningCircle, text, children, className, role }: {
  tone?: 'warning' | 'sand';
  /** Overrides the tone's live-region role (a standing banner is `status`, not an alert). */
  role?: 'alert' | 'status';
  icon?: Icon;
  text: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role={role ?? (tone === 'warning' ? 'alert' : 'status')} className={cn('flex w-full items-center gap-s12 rounded-md px-s16 py-s12', tone === 'warning' ? 'bg-warning-bg' : 'bg-sand', className)}>
      <IconCmp size={24} aria-hidden className="shrink-0 text-ink" />
      <p className="min-w-0 flex-1 text-body-m text-ink">{text}</p>
      {children}
    </div>
  );
}
