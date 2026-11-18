import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

// Figma DS «Input» (16:294): label, 52px field, hint or error; states default, focused, filled, error, disabled.
export const fieldClass = (error?: boolean) =>
  cn(
    'h-[52px] w-full rounded-sm border px-s16 text-body-l text-ink outline-none placeholder:text-muted',
    'focus:border-2 focus:border-ember focus:px-[15px] disabled:bg-sand disabled:text-muted-soft',
    error ? 'border-danger bg-danger-bg' : 'border-line bg-paper',
  );

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
  className?: string;
};

/** Label + control + hint/error wiring, for any control (input, select, phone, OTP). */
export function FormField({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  const note = error ?? hint;
  return (
    <div className={cn('flex flex-col gap-s8', className)}>
      <label htmlFor={id} className="text-label-m text-ink-2">
        {label}
      </label>
      {children({ id, describedBy: note ? `${id}-note` : undefined, invalid: !!error })}
      {note && (
        <p id={`${id}-note`} role={error ? 'alert' : undefined} className={cn('text-body-m', error ? 'text-danger' : 'text-muted')}>
          {note}
        </p>
      )}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function TextInput({ invalid, className, ...props }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cn(fieldClass(invalid), className)} {...props} />;
  },
);

/** react-hook-form friendly text field. */
export const InputField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }
>(function InputField({ label, hint, error, ...props }, ref) {
  return (
    <FormField label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => <TextInput ref={ref} id={id} aria-describedby={describedBy} invalid={invalid} {...props} />}
    </FormField>
  );
});
