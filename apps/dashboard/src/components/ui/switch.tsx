import { useId } from 'react';
import { cn } from '@/lib/utils';

// Figma DS «Switch» (16:411): checked (ember, knob at the end) / unchecked (sand, muted border, knob at the start), disabled.
// `hideLabel`: the label is read out only (a table's availability toggle).
export function Switch({ label, checked, onChange, disabled, hideLabel, describedBy }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; hideLabel?: boolean; describedBy?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('flex h-11 items-center gap-s12', disabled ? 'text-muted-soft' : 'text-ink')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-7 w-12 shrink-0 items-center rounded-pill border px-[3px]',
          checked ? 'justify-end border-ember bg-ember' : 'justify-start border-muted bg-sand',
          disabled && 'border-muted-soft bg-sand',
        )}
      >
        <span className={cn('size-[22px] rounded-pill', disabled ? 'bg-muted-soft' : checked ? 'bg-paper' : 'bg-muted')} />
      </button>
      <span className={hideLabel ? 'sr-only' : 'text-body-l'}>{label}</span>
    </label>
  );
}
