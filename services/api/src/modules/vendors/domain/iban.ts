/** A Saudi IBAN: SA, 2 check digits, a 2-digit bank code, an 18-character account number. */
const SAUDI_IBAN = /^SA\d{4}[A-Z0-9]{18}$/;

/**
 * The remainder of an IBAN's number modulo 97 (ISO 13616): the first four characters
 * moved to the end, each letter replaced by two digits (A = 10 … Z = 35), read as one
 * number. Computed piece by piece, since the number is too long for a double.
 */
function ibanRemainder(iban: string): number {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const character of rearranged) {
    const code = character.charCodeAt(0);
    const digits = code >= 65 ? String(code - 55) : character;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder;
}

/**
 * A valid Saudi IBAN (country SA, 24 characters, a correct mod-97 checksum), kept only
 * long enough to be encrypted: it is never stored in clear, logged or sent back, only
 * its last four characters (`last4`, shown masked by maskIban).
 */
export class Iban {
  private constructor(private readonly value: string) {}

  /**
   * The IBAN in `text`, which must already be in electronic form: capital letters and
   * Latin digits, no spaces (the API's DTO normalises what people type). Null when it is
   * not a valid Saudi IBAN.
   */
  static parse(text: string): Iban | null {
    return SAUDI_IBAN.test(text) && ibanRemainder(text) === 1
      ? new Iban(text)
      : null;
  }

  /** The last four characters, for the masked form. */
  get last4(): string {
    return this.value.slice(-4);
  }

  /** The IBAN in electronic form: what is encrypted. Never log or return it. */
  reveal(): string {
    return this.value;
  }

  /** Never the IBAN itself, so it cannot reach a log line by accident. */
  toString(): string {
    return `Iban(…${this.last4})`;
  }

  toJSON(): string {
    return this.toString();
  }
}
