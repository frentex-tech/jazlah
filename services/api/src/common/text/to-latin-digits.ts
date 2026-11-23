/** Arabic-Indic (U+0660 to U+0669) and Extended Arabic-Indic (U+06F0 to U+06F9) digits. */
const ARABIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;

/** The Latin digit of an Arabic-Indic or Extended Arabic-Indic digit. */
function toLatinDigit(digit: string): string {
  const code = digit.charCodeAt(0);
  return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
}

/**
 * `text` with every Arabic-Indic (٠ to ٩) and Extended Arabic-Indic (۰ to ۹) digit
 * replaced by its Latin digit, and everything else unchanged: digits of other scripts
 * stay as they are. For what people type on an Arabic or Persian keyboard: phone
 * numbers (normalizeSaudiMobileNumber) and verification codes.
 */
export function toLatinDigits(text: string): string {
  return text.replace(ARABIC_DIGITS, toLatinDigit);
}
