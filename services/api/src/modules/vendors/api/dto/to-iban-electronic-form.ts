import { removeFormatCharacters } from '@common/text/remove-format-characters';
import { toLatinDigits } from '@common/text/to-latin-digits';

/**
 * An IBAN as people type or paste it, in electronic form: invisible format characters
 * and spaces removed, Arabic digits in Latin, letters in capitals
 * (`sa03 8000 ٠٠٠٠ …` becomes `SA038000…`). Validity is checked after (IsSaudiIban).
 */
export function toIbanElectronicForm(value: unknown): unknown {
  return typeof value === 'string'
    ? toLatinDigits(removeFormatCharacters(value))
        .replace(/\s+/g, '')
        .toUpperCase()
    : value;
}
