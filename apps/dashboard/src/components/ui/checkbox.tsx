import { Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

// Figma DS «Checkbox» (16:393): 24px box, r6, 2px border; checked = ember with a paper check; disabled = muted-soft.
export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <label className={cn('flex min-h-11 items-center gap-s12 text-body-l', disabled ? 'text-muted-soft' : 'text-ink')}>
      <span className="relative flex size-6 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.checked)}
          className={cn(
            'peer size-6 appearance-none rounded-[6px] border-2 outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2',
            'checked:border-ember checked:bg-ember disabled:border-muted-soft disabled:bg-sand',
            invalid ? 'border-danger' : 'border-muted',
          )}
        />
        <Check size={16} weight="bold" aria-hidden className={cn('pointer-events-none absolute inset-1 hidden peer-checked:block', disabled ? 'text-muted-soft' : 'text-paper')} />
      </span>
      {label}
    </label>
  );
}
