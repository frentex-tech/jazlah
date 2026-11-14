/** Spaces and dashes a person may type between the digits. */
const SEPARATORS = /[\s-]/g;

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
 * `5…`, `9665…`, `009665…` or `+9665…`, with spaces or dashes anywhere between the
 * digits. Anything else returns null: a landline, another country, a trunk zero after
 * the country code (`+96605…`), letters, other punctuation, or the wrong length.
 *
 * Mobile means the national range 5 followed by 8 digits; operators' prefixes inside it
 * are not checked, so a newly assigned prefix is accepted.
 */
export function normalizeSaudiMobileNumber(input: string): string | null {
  const compact = input.trim().replace(SEPARATORS, '');
  for (const form of SAUDI_MOBILE_FORMS) {
    const match = form.exec(compact);
    if (match !== null) {
      return `+9665${match[1]}`;
    }
  }
  return null;
}
