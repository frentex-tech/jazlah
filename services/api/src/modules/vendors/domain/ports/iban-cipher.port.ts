import type { Iban } from '../iban';
import type { SealedIban } from '../sealed-iban.type';

/** Injection token of the IbanCipher. */
export const IBAN_CIPHER = Symbol('IBAN_CIPHER');

/** Seals an IBAN for storage: encrypted with the current key, last four kept in clear. */
export interface IbanCipher {
  seal(iban: Iban): SealedIban;
}
