import { removeFormatCharacters } from '../text/remove-format-characters';

/**
 * A `@Transform` for a short single-line text such as a person's or a city's name:
 * invisible format characters removed (phones add direction marks to pasted Arabic),
 * runs of spaces made one, surrounding spaces removed. Other values unchanged.
 */
export function toCompactText({ value }: { value: unknown }): unknown {
  return typeof value === 'string'
    ? removeFormatCharacters(value).replace(/\s+/g, ' ').trim()
    : value;
}
