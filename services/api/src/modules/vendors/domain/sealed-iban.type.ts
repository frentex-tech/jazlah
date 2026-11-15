/**
 * An IBAN as it is stored: encrypted (IbanCipher), with the id of the key and its last
 * four characters in clear for the masked form.
 */
export type SealedIban = Readonly<{
  keyId: string;
  ciphertext: string;
  last4: string;
}>;
