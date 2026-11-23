import { Hourglass, LockSimple, MagnifyingGlass, Receipt, ShoppingBag, WarningCircle, WifiSlash } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// Figma DS «State panel» (16:877): empty / error / offline / denied states, and «coming soon» (an API route that answers
// NOT_IMPLEMENTED until its task lands; no frame: the panel with the info tint).
const kinds = {
  cart: { icon: ShoppingBag, circle: 'bg-sand', color: 'text-ink-2' },
  orders: { icon: Receipt, circle: 'bg-sand', color: 'text-ink-2' },
  search: { icon: MagnifyingGlass, circle: 'bg-sand', color: 'text-ink-2' },
  error: { icon: WarningCircle, circle: 'bg-danger-bg', color: 'text-danger' },
  offline: { icon: WifiSlash, circle: 'bg-warning-bg', color: 'text-warning' },
  denied: { icon: LockSimple, circle: 'bg-sand', color: 'text-ink-2' },
  soon: { icon: Hourglass, circle: 'bg-info-bg', color: 'text-info' },
} satisfies Record<string, { icon: Icon; circle: string; color: string }>;

export type StatePanelKind = keyof typeof kinds;

export function StatePanel({
  kind,
  title,
  body,
  action,
  className,
}: {
  kind: StatePanelKind;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const { icon: IconCmp, circle, color } = kinds[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('flex w-[342px] flex-col items-center gap-s12 p-s24 text-center', className)}>
      <span className={cn('flex size-[88px] items-center justify-center rounded-pill', circle)}>
        <IconCmp size={40} className={color} aria-hidden />
      </span>
      <p className="text-h2 text-ink">{title}</p>
      <p className="text-body-m text-ink-2">{body}</p>
      {action}
    </div>
  );
}
