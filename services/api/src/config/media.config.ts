import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `media` namespace: how long an upload may stay unconfirmed, and how often the
 * cleanup of unconfirmed uploads runs (`src/modules/media/`). Inject with
 * `@Inject(mediaConfig.KEY) config: MediaConfig`.
 */
export const mediaConfig = registerAs('media', () => {
  const env = loadEnv();
  return {
    pendingUploadTtlSeconds: env.MEDIA_PENDING_UPLOAD_TTL_SECONDS,
    cleanupIntervalSeconds: env.MEDIA_CLEANUP_INTERVAL_SECONDS,
  };
});
