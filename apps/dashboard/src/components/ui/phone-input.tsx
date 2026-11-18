'use client';

import { forwardRef, useId } from 'react';
import { formatNational, nationalDigits } from '@/lib/phone';
import { cn } from '@/lib/utils';

// Figma DS «Phone input» (16:320): label, +966 prefix and number field, hint or error; states default, error, disabled.
export const PhoneInput = forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder: string;
    hint?: string;
    error?: string;
    value: string; // national digits, e.g. "551234567"
    onChange: (digits: string) => void;
    disabled?: boolean;
    onBlur?: () => void;
  }
>(function PhoneInput({ label, placeholder, hint, error, value, onChange, disabled, onBlur }, ref) {
  const id = useId();
  const note = error ?? hint;
  return (
    <div className="flex w-full flex-col gap-s8">
      <label htmlFor={id} className="text-label-m text-ink-2">
        {label}
      </label>
      <div className="flex h-[52px] gap-s8">
        <span
          dir="ltr"
          className="flex w-[88px] shrink-0 items-center justify-center rounded-sm border border-line bg-sand text-label-m text-ink"
        >
          +966
        </span>
        <input
          ref={ref}
          id={id}
          dir="ltr"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={formatNational(value)}
          onChange={(e) => onChange(nationalDigits(e.target.value))}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={note ? `${id}-note` : undefined}
          className={cn(
            'min-w-0 flex-1 rounded-sm border px-s16 text-start text-body-l text-ink outline-none placeholder:text-muted',
            'focus:border-2 focus:px-[15px] disabled:bg-sand disabled:text-muted-soft',
            error ? 'border-danger bg-danger-bg focus:border-danger' : 'border-line bg-paper focus:border-ember',
          )}
        />
      </div>
      {note && (
        <p id={`${id}-note`} role={error ? 'alert' : undefined} className={cn('text-body-m', error ? 'text-danger' : 'text-muted')}>
          {note}
        </p>
      )}
    </div>
  );
});
