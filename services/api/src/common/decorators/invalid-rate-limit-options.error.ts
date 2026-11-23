/**
 * `@RateLimit` was given settings it refuses. Thrown when the decorator runs, that is
 * when the controller's file is loaded, so the application does not start.
 */
export class InvalidRateLimitOptionsError extends Error {
  constructor(name: string, problem: string) {
    super(`@RateLimit "${name}": ${problem}`);
    this.name = 'InvalidRateLimitOptionsError';
  }
}
