import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `storage` namespace: the object storage the storage integration
 * (`src/integrations/storage/`) talks to. Inject with
 * `@Inject(storageConfig.KEY) config: StorageConfig`.
 *
 * `accessKeyId` and `secretAccessKey` are credentials: never log them, put them in an
 * error or return them to a client.
 */
export const storageConfig = registerAs('storage', () => {
  const env = loadEnv();
  return {
    provider: env.STORAGE_PROVIDER,
    /** Unset: the provider's own endpoint for the region. */
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    publicBucket: env.STORAGE_PUBLIC_BUCKET,
    privateBucket: env.STORAGE_PRIVATE_BUCKET,
    publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
    uploadUrlExpirySeconds: env.STORAGE_UPLOAD_URL_EXPIRY_SECONDS,
    downloadUrlExpirySeconds: env.STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS,
  };
});
