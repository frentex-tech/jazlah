import type { Iban } from '../iban';
import type { IbanCipher } from '../ports/iban-cipher.port';
import type { SealedIban } from '../sealed-iban.type';

/** IbanCipher for tests: a reversible stand-in, never the real cipher, recording what it sealed. */
export class InMemoryIbanCipher implements IbanCipher {
  readonly sealed: string[] = [];

  seal(iban: Iban): SealedIban {
    this.sealed.push(iban.reveal());
    return {
      keyId: 'test-key',
      ciphertext: `sealed:${[...iban.reveal()].reverse().join('')}`,
      last4: iban.last4,
    };
  }
}
