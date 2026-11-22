import { Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

export type TimelineStep = { key: string; label: string; time?: string; state: 'done' | 'current' | 'todo'; danger?: boolean };

// Figma DS «Status timeline» (16:1116): a paper card (line border, r18, 16 padding); per step a 24 marker (done: success
// with a check; current: ember ring with an 8 dot, Label/M title; to do: sand) joined by a 2×28 line, the title (Body/M)
// and its time (Caption) beside it. `danger` (a cancelled or failed order) draws the current step in danger.
export function StatusTimeline({ steps, label }: { steps: TimelineStep[]; label: string }) {
  return (
    <ol aria-label={label} className="flex flex-col rounded-md border border-line bg-paper p-s16">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.key} aria-current={s.state === 'current' ? 'step' : undefined} className="flex gap-s12">
            <span className="flex w-6 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-pill',
                  s.state === 'done' && 'bg-success',
                  s.state === 'current' && (s.danger ? 'border-2 border-danger bg-paper' : 'border-2 border-ember bg-paper'),
                  s.state === 'todo' && 'bg-sand',
                )}
              >
                {s.state === 'done' && <Check size={14} weight="bold" className="text-paper" aria-hidden />}
                {s.state === 'current' && <span className={cn('size-2 rounded-pill', s.danger ? 'bg-danger' : 'bg-ember')} />}
              </span>
              {!last && <span aria-hidden className={cn('h-7 w-0.5 rounded-[1px]', s.state === 'done' ? 'bg-success' : 'bg-line')} />}
            </span>
            <span className={cn('flex flex-col gap-[2px]', !last && 'h-[52px]')}>
              <span className={cn(s.state === 'current' ? 'text-label-m' : 'text-body-m', s.state === 'todo' ? 'text-ink-2' : s.danger ? 'text-danger' : 'text-ink')}>{s.label}</span>
              {s.time && <span className="text-caption text-ink-2">{s.time}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
