import { compactPhoneInput } from './compact-phone-input';
import { normalizeSaudiMobileNumber } from './normalize-saudi-mobile-number';

/**
 * The landline forms accepted once separators are removed; group 1 is the national
 * number: a geographic area code (11, 12, 13, 14, 16 or 17) and 7 digits.
 */
const SAUDI_LANDLINE_FORMS: readonly RegExp[] = [
  /^\+966(1[1-467]\d{7})$/, // +966 1X XXX XXXX
  /^00966(1[1-467]\d{7})$/, // 00966 1X XXX XXXX
  /^966(1[1-467]\d{7})$/, // 966 1X XXX XXXX
  /^0(1[1-467]\d{7})$/, // 01X XXX XXXX
  /^(1[1-467]\d{7})$/, // 1X XXX XXXX
];

/**
 * A Saudi phone number in E.164: a mobile (`+9665XXXXXXXX`, as
 * normalizeSaudiMobileNumber) or a geographic landline (`+9661XXXXXXXX`, area code 011,
 * 012, 013, 014, 016 or 017 and 7 digits), from the same typed forms (`0…`, without the
 * trunk zero, `966…`, `00966…`, `+966…`; separators, invisible format characters and
 * Arabic digits as compactPhoneInput). Anything else returns null: another area code,
 * another country, a trunk zero after the country code, letters or the wrong length.
 * For contact numbers, never for sign-in (which is mobile only).
 */
export function normalizeSaudiPhoneNumber(input: string): string | null {
  const mobile = normalizeSaudiMobileNumber(input);
  if (mobile !== null) {
    return mobile;
  }
  const compact = compactPhoneInput(input);
  for (const form of SAUDI_LANDLINE_FORMS) {
    const match = form.exec(compact);
    if (match !== null) {
      return `+966${match[1]}`;
    }
  }
  return null;
}
