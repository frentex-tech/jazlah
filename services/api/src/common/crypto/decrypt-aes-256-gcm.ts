import { createDecipheriv } from 'node:crypto';
import type { EncryptedText } from './encrypted-text.type';
import type { EncryptionKey } from './encryption-key.type';

const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * The text encryptAes256Gcm sealed, read with the key whose id it carries, from `keys`
 * (the current key, and earlier ones while a rotation is under way). Throws when no key
 * has that id, or when the bytes or the key are wrong (the authentication tag does not
 * match): never returns altered text.
 */
export function decryptAes256Gcm(
  encrypted: EncryptedText,
  keys: readonly EncryptionKey[],
): string {
  const key = keys.find((candidate) => candidate.id === encrypted.keyId);
  if (key === undefined) {
    throw new Error(`No encryption key has the id ${encrypted.keyId}`);
  }
  const sealed = Buffer.from(encrypted.ciphertext, 'base64url');
  if (sealed.length < IV_BYTES + TAG_BYTES) {
    throw new Error('The encrypted text is too short');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key.key,
    sealed.subarray(0, IV_BYTES),
  );
  decipher.setAuthTag(sealed.subarray(sealed.length - TAG_BYTES));
  return Buffer.concat([
    decipher.update(sealed.subarray(IV_BYTES, sealed.length - TAG_BYTES)),
    decipher.final(),
  ]).toString('utf8');
}
