import { randomBytes } from 'node:crypto';
import { decryptAes256Gcm } from '@common/crypto/decrypt-aes-256-gcm';
import { Iban } from '../domain/iban';
import { AesGcmIbanCipher } from './aes-gcm-iban-cipher';

const IBAN = 'SA0380000000608010167519';

describe('AesGcmIbanCipher', () => {
  it('seals with the configured key and id, keeping the last four in clear only', () => {
    const ibanKey = { id: 'k1', key: randomBytes(32) };
    const iban = Iban.parse(IBAN);
    if (iban === null) {
      throw new Error('the example IBAN is valid');
    }

    const sealed = new AesGcmIbanCipher({ ibanKey }).seal(iban);

    expect(sealed.keyId).toBe('k1');
    expect(sealed.last4).toBe('7519');
    expect(sealed.ciphertext).not.toContain(IBAN);
    expect(
      decryptAes256Gcm({ keyId: sealed.keyId, ciphertext: sealed.ciphertext }, [
        ibanKey,
      ]),
    ).toBe(IBAN);
  });
});
