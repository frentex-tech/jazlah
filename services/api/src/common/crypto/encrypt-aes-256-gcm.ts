import { createCipheriv, randomBytes } from 'node:crypto';
import type { EncryptedText } from './encrypted-text.type';
import type { EncryptionKey } from './encryption-key.type';

/** Bytes of the IV: 96 bits, the size GCM is designed for. */
const IV_BYTES = 12;

/**
 * `plaintext` encrypted with AES-256-GCM under `key`, with a fresh random IV: the same
 * text encrypts differently every time, and any change to the stored bytes is detected
 * when it is decrypted (decryptAes256Gcm). For data at rest that must stay readable to
 * the API only (an IBAN); a secret nobody needs back is hashed instead.
 */
export function encryptAes256Gcm(
  plaintext: string,
  key: EncryptionKey,
): EncryptedText {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key.key, iv);
  const sealed = Buffer.concat([
    iv,
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return { keyId: key.id, ciphertext: sealed.toString('base64url') };
}
