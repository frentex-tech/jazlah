import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `vendors` namespace: the key that encrypts vendors' IBANs (AES-256-GCM) and its id,
 * stored beside each ciphertext so the key can be rotated later. Inject with
 * `@Inject(vendorsConfig.KEY) config: VendorsConfig`.
 */
export const vendorsConfig = registerAs('vendors', () => {
  const env = loadEnv();
  return {
    ibanKey: {
      id: env.VENDORS_IBAN_KEY_ID,
      key: Buffer.from(env.VENDORS_IBAN_KEY, 'base64'),
    },
  };
});
