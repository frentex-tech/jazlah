import { removeFormatCharacters } from '@common/text/remove-format-characters';

/**
 * A `@Transform` for a person's name: invisible format characters removed (phones add
 * direction marks to pasted Arabic), runs of spaces made one, surrounding spaces
 * removed. Other values unchanged.
 */
export function toPersonName({ value }: { value: unknown }): unknown {
  return typeof value === 'string'
    ? removeFormatCharacters(value).replace(/\s+/g, ' ').trim()
    : value;
}
