import { removeFormatCharacters } from '@common/text/remove-format-characters';
import { toLatinDigits } from '@common/text/to-latin-digits';

/**
 * A `@Transform` for numbers typed or pasted as digits: invisible format characters and
 * spaces removed, Arabic digits in Latin.
 */
export function toDigits({ value }: { value: unknown }): unknown {
  return typeof value === 'string'
    ? toLatinDigits(removeFormatCharacters(value)).replace(/\s+/g, '')
    : value;
}
