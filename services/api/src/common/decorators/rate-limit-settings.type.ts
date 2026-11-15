/** The numbers of one rate limit counter. Times are in milliseconds. */
export type RateLimitSettings = Readonly<{
  /** Requests allowed per key in each window. A positive whole number. */
  limit: number;
  /** A positive whole number of milliseconds. */
  windowMs: number;
  /**
   * How long a client that went over stays refused. At least `windowMs`.
   * Default: `windowMs`.
   */
  blockMs?: number;
}>;
