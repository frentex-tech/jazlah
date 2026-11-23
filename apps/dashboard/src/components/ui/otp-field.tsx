'use client';

import { forwardRef, useState } from 'react';
import { toLatin } from '@/lib/phone';
import { cn } from '@/lib/utils';

// Figma DS «OTP field» (16:349): one cell per digit (default, filled, error). One real input underneath, so paste,
// SMS autofill (one-time-code) and Arabic digits work; the cells only draw it. Digits read left to right.
export const OtpField = forwardRef<
  HTMLInputElement,
  { length: number; value: string; onChange: (v: string) => void; error?: string; label: string; disabled?: boolean }
>(function OtpField({ length, value, onChange, error, label, disabled }, ref) {
  const [focused, setFocused] = useState(false);
  // Figma's cells are 56 wide with a 12 gap for 4 digits; longer codes narrow the cells to fit the 358 card width.
  const cellWidth = length <= 4 ? 56 : Math.floor((358 - 12 * (length - 1)) / length);
  return (
    <div className="flex flex-col items-center gap-s8">
      <div dir="ltr" className="relative flex gap-s12">
        {Array.from({ length }, (_, i) => {
          const active = focused && !error && i === Math.min(value.length, length - 1);
          return (
            <span
              key={i}
              aria-hidden
              style={{ width: cellWidth }}
              className={cn(
                'flex h-16 items-center justify-center rounded-md border text-h1 text-ink',
                error ? 'border-danger bg-danger-bg' : active ? 'border-2 border-ember bg-paper' : 'border-line bg-paper',
              )}
            >
              {value[i] ?? ''}
            </span>
          );
        })}
        <input
          ref={ref}
          aria-label={label}
          aria-invalid={!!error || undefined}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length * 2}
          value={value}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(toDigits(e.target.value).slice(0, length))}
          className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-center text-body-m text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

/** Latin digits only; Arabic-Indic digits are converted, spaces dropped (the API does the same). */
export function toDigits(s: string): string {
  return toLatin(s).replace(/\D/g, '');
}
