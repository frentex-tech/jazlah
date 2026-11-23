/** Text encrypted with encryptAes256Gcm: the key's id and the sealed bytes. */
export type EncryptedText = Readonly<{
  keyId: string;
  /** base64url of the 12-byte IV, the ciphertext and the 16-byte authentication tag. */
  ciphertext: string;
}>;
