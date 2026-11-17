import { removeFormatCharacters } from '../text/remove-format-characters';
import { toLatinDigits } from '../text/to-latin-digits';

/**
 * Spaces and dashes a person may type between the digits, removed before the number is
 * read (invisible format characters are removed by removeFormatCharacters).
 */
const SEPARATORS = /[\s-]/gu;

/**
 * A typed phone number ready to be matched against its forms: invisible format
 * characters (direction marks, zero-width characters), spaces and dashes removed, and
 * Arabic-Indic (٠ to ٩) or Extended Arabic-Indic (۰ to ۹) digits made Latin. The
 * Saudi normalisers (normalizeSaudiMobileNumber, normalizeSaudiPhoneNumber) read this.
 */
export function compactPhoneInput(input: string): string {
  return toLatinDigits(removeFormatCharacters(input).replace(SEPARATORS, ''));
}
