// Saudi mobile numbers as typed in the dashboard: Arabic or Latin digits, spaces, an optional 0 / 966 / +966.

const ARABIC_DIGITS = /[٠-٩۰-۹]/g;
export const toLatin = (s: string) => s.replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf) % 10));

/** The 9 national digits typed so far ("0551234567" → "551234567"), at most 9. */
export function nationalDigits(input: string): string {
  let d = toLatin(input).replace(/\D/g, '');
  if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 9);
}

/** E.164 ("+966551234567") when the input is a complete Saudi mobile number, else null. */
export function toE164(input: string): string | null {
  const d = nationalDigits(input);
  return /^5\d{8}$/.test(d) ? `+966${d}` : null;
}

/** "551234567" → "55 123 4567", as in the Figma field. */
export function formatNational(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean).join(' ');
}
