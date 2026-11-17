import { removeFormatCharacters } from '@common/text/remove-format-characters';
import { toLatinDigits } from '@common/text/to-latin-digits';

/**
 * A `@Transform` for the short national address as people type it (`rrrd 2929`,
 * Arabic digits): format characters and spaces removed, digits made Latin, letters
 * uppercase; blank becomes null. Other values unchanged. The format is checked after.
 */
export function toShortNationalAddress({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const code = toLatinDigits(removeFormatCharacters(value))
    .replace(/\s+/g, '')
    .toUpperCase();
  return code === '' ? null : code;
}
