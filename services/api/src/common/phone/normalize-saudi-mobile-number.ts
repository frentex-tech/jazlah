import { toLatinDigits } from '../text/to-latin-digits';

/**
 * What is removed before the number is read: spaces and dashes a person may type between
 * the digits, and Unicode format characters (`\p{Cf}`), which are invisible: direction
 * marks (U+200E, U+200F, U+202A to U+202E, U+2066 to U+2069) that phones insert when a
 * number is copied in an Arabic interface, and zero-width characters (U+200B, U+FEFF).
 */
const SEPARATORS = /[\s\p{Cf}-]/gu;

/** The forms accepted once separators are removed; group 1 is the 8 digits after 5. */
const SAUDI_MOBILE_FORMS: readonly RegExp[] = [
  /^\+9665(\d{8})$/, // +966 5X XXX XXXX
  /^009665(\d{8})$/, // 00966 5X XXX XXXX
  /^9665(\d{8})$/, // 966 5X XXX XXXX
  /^05(\d{8})$/, // 05X XXX XXXX
  /^5(\d{8})$/, // 5X XXX XXXX
];

/**
 * A Saudi mobile number in E.164 (`+9665XXXXXXXX`), from the forms people type: `05…`,
 * `5…`, `9665…`, `009665…` or `+9665…`, with spaces, dashes or invisible format
 * characters (direction marks, zero-width characters) anywhere between the digits, in Latin, Arabic-Indic (٠ to ٩) or Extended Arabic-Indic (۰ to ۹) digits, mixed
 * or not: they are converted to Latin before the number is checked. Anything else returns null: a landline, another country, a trunk zero after
 * the country code (`+96605…`), letters, other punctuation, or the wrong length.
 *
 * Mobile means the national range 5 followed by 8 digits; operators' prefixes inside it
 * are not checked, so a newly assigned prefix is accepted.
 */
export function normalizeSaudiMobileNumber(input: string): string | null {
  const compact = toLatinDigits(input.trim().replace(SEPARATORS, ''));
  for (const form of SAUDI_MOBILE_FORMS) {
    const match = form.exec(compact);
    if (match !== null) {
      return `+9665${match[1]}`;
    }
  }
  return null;
}
