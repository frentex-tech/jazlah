import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';

const MINUTE_MS = 60_000;

/**
 * The stricter limits on the upload endpoints, because each upload costs storage: shared
 * by the customer, vendor and admin endpoints and failing closed while Redis is down.
 * The numbers are this session's choice (`.claude/DECISIONS.md`, Vendors): well above
 * what a person uploads (an application has at most ten documents), low enough that one
 * address or one account cannot fill the storage.
 *
 * - `address`: upload requests per client address (`@RateLimit` on `uploads`).
 * - `confirm`: confirmations per client address (`@RateLimit` on `:id/confirm`).
 * - `owner`: upload requests per signed-in user, counted by `MediaService.requestUpload`
 *   with RateLimiter, whatever the address.
 */
export const MEDIA_RATE_LIMITS = {
  address: {
    name: 'media-upload',
    failClosed: true,
    limit: 30,
    windowMs: MINUTE_MS,
  },
  confirm: {
    name: 'media-confirm',
    failClosed: true,
    limit: 60,
    windowMs: MINUTE_MS,
  },
  owner: {
    name: 'media-upload-owner',
    failClosed: true,
    limit: 100,
    windowMs: 60 * MINUTE_MS,
  },
} as const satisfies Readonly<Record<string, RateLimitOptions>>;
