/** The rate limit script answered with something other than four numbers. Internal. */
export class InvalidRateLimitReplyError extends Error {
  constructor() {
    super('The rate limit script returned an unexpected reply');
    this.name = 'InvalidRateLimitReplyError';
  }
}
