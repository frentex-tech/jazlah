import { cn } from '@/lib/utils';

/**
 * The 44px value boxes of the sizes rows (131:35405); an error shows as the danger border with the message in the box
 * when it is empty (131:36439), and is read out either way.
 */
export function SmallInput({
  label, value, onChange, error, suffix, className, placeholder, ...rest
}: { label: string; value: string; onChange: (v: string) => void; error?: string; suffix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <label className={cn('flex h-11 shrink-0 items-center gap-s8 rounded-sm border px-s12', error ? 'border-danger' : 'border-line', 'bg-paper', className)}>
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        placeholder={error && !value ? error : placeholder}
        className={cn('min-w-0 flex-1 bg-transparent text-body-m text-ink outline-none', error && !value ? 'placeholder:text-ink' : 'placeholder:text-muted')}
        {...rest}
      />
      {suffix && <span className="text-body-m text-ink-2">{suffix}</span>}
      {error && <span role="alert" className="sr-only">{`${label}: ${error}`}</span>}
    </label>
  );
}
