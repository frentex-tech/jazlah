/**
 * The rate limits declared on the controllers contradict each other (checkRateLimitPolicies).
 * Thrown while the application starts, so it does not start.
 */
export class InvalidRateLimitSetupError extends Error {
  constructor(problem: string) {
    super(problem);
    this.name = 'InvalidRateLimitSetupError';
  }
}
