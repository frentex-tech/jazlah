/** A symmetric key and the id stored beside everything it encrypts, so it can be rotated. */
export type EncryptionKey = Readonly<{
  /** 1 to 32 letters, digits, dashes or underscores. */
  id: string;
  /** 32 bytes for AES-256. */
  key: Buffer;
}>;
