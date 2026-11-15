import { randomBytes } from 'node:crypto';
import { decryptAes256Gcm } from './decrypt-aes-256-gcm';
import { encryptAes256Gcm } from './encrypt-aes-256-gcm';
import type { EncryptionKey } from './encryption-key.type';

const KEY: EncryptionKey = { id: 'k1', key: randomBytes(32) };

describe('encryptAes256Gcm and decryptAes256Gcm', () => {
  it('round-trips the text and records the key id', () => {
    const sealed = encryptAes256Gcm('SA0380000000608010167519', KEY);

    expect(sealed.keyId).toBe('k1');
    expect(sealed.ciphertext).not.toContain('SA0380000000608010167519');
    expect(decryptAes256Gcm(sealed, [KEY])).toBe('SA0380000000608010167519');
  });

  it('encrypts the same text differently each time', () => {
    expect(encryptAes256Gcm('same', KEY).ciphertext).not.toBe(
      encryptAes256Gcm('same', KEY).ciphertext,
    );
  });

  it('decrypts with the key named by the id, among several', () => {
    const next: EncryptionKey = { id: 'k2', key: randomBytes(32) };
    const sealed = encryptAes256Gcm('text', KEY);

    expect(decryptAes256Gcm(sealed, [next, KEY])).toBe('text');
  });

  it('refuses an unknown key id', () => {
    const sealed = encryptAes256Gcm('text', KEY);

    expect(() => decryptAes256Gcm({ ...sealed, keyId: 'k9' }, [KEY])).toThrow(
      'No encryption key has the id k9',
    );
  });

  it('refuses altered bytes and a wrong key', () => {
    const sealed = encryptAes256Gcm('text', KEY);
    const bytes = Buffer.from(sealed.ciphertext, 'base64url');
    bytes[13] = (bytes[13] ?? 0) ^ 1;

    expect(() =>
      decryptAes256Gcm({ ...sealed, ciphertext: bytes.toString('base64url') }, [
        KEY,
      ]),
    ).toThrow();
    expect(() =>
      decryptAes256Gcm(sealed, [{ id: 'k1', key: randomBytes(32) }]),
    ).toThrow();
    expect(() =>
      decryptAes256Gcm({ keyId: 'k1', ciphertext: 'c2hvcnQ' }, [KEY]),
    ).toThrow('The encrypted text is too short');
  });
});
