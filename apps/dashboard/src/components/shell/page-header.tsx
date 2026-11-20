import { cn } from '@/lib/utils';

// Figma DS «Page header» (16:1252): breadcrumb + H1 on the start side, actions on the end side. Without actions the
// titles sit on the end side, as in the vendor board frame (135:39184), unless `start` (store profile, 131:24074).
export function PageHeader({ breadcrumb, title, actions, start }: { breadcrumb: string; title: string; actions?: React.ReactNode; start?: boolean }) {
  return (
    <div className={cn('flex w-full items-center gap-s16', actions || start ? 'justify-between' : 'justify-end')}>
      <div className="flex flex-col gap-s4">
        <p className="text-body-m text-ink-2">{breadcrumb}</p>
        <h1 className="text-h1 text-ink">{title}</h1>
      </div>
      {actions ? <div className="flex items-start gap-s12">{actions}</div> : null}
    </div>
  );
}
