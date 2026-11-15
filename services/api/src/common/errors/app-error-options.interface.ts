export interface AppErrorOptions {
  /** Overrides the status the code normally takes (error-statuses.constants.ts). */
  status?: number;
  /** Sent to the client as `details`. Never put secrets or personal data here. */
  details?: unknown;
  /**
   * How long the client should wait before trying again, in seconds. The error filter
   * sends it as the `Retry-After` header. For RATE_LIMITED raised outside the rate
   * limit guard, which sets the header itself.
   */
  retryAfterSeconds?: number;
  /** The underlying error. Logged, never sent to the client. */
  cause?: unknown;
}
