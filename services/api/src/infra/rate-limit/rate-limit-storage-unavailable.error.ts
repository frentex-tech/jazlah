/**
 * The rate limit storage could not count a request: Redis is not connected, failed,
 * answered oddly or did not answer in time. The caller decides what that means: the
 * guard and the pre-routing limiter let the request through (fail open), or, for a
 * `@RateLimit({ failClosed: true })` endpoint, refuse it with SERVICE_UNAVAILABLE.
 * Internal: never sent to a client.
 */
export class RateLimitStorageUnavailableError extends Error {
  constructor(options?: { cause?: unknown }) {
    super('The rate limit storage is unavailable', options);
    this.name = 'RateLimitStorageUnavailableError';
  }
}
