/**
 * The shared Redis client was not connected when a request was counted, so the rate
 * limit storage did not send the command. The cause of a RateLimitStorageUnavailableError.
 */
export class RedisNotReadyError extends Error {
  constructor(status: string) {
    super(`The Redis client is not ready (status: ${status})`);
    this.name = 'RedisNotReadyError';
  }
}
