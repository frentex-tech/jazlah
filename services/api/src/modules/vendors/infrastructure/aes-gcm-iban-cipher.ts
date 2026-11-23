import { Inject, Injectable } from '@nestjs/common';
import { encryptAes256Gcm } from '@common/crypto/encrypt-aes-256-gcm';
import { vendorsConfig } from '@config/vendors.config';
import type { VendorsConfig } from '@config/vendors-config.type';
import type { Iban } from '../domain/iban';
import type { IbanCipher } from '../domain/ports/iban-cipher.port';
import type { SealedIban } from '../domain/sealed-iban.type';

/**
 * Seals IBANs with AES-256-GCM under VENDORS_IBAN_KEY, recording VENDORS_IBAN_KEY_ID
 * beside each ciphertext (decryptAes256Gcm reads it back when a payout needs it).
 */
@Injectable()
export class AesGcmIbanCipher implements IbanCipher {
  constructor(
    @Inject(vendorsConfig.KEY)
    private readonly config: Pick<VendorsConfig, 'ibanKey'>,
  ) {}

  seal(iban: Iban): SealedIban {
    const encrypted = encryptAes256Gcm(iban.reveal(), this.config.ibanKey);
    return {
      keyId: encrypted.keyId,
      ciphertext: encrypted.ciphertext,
      last4: iban.last4,
    };
  }
}
