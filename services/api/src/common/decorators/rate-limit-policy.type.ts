/**
 * The settings of one `@RateLimit` counter, validated and with defaults applied. Stored
 * as metadata on the endpoint (RATE_LIMIT_POLICY) and read by the rate limit guard and
 * the startup check.
 */
export type RateLimitPolicy = Readonly<{
  name: string;
  limit: number;
  windowMs: number;
  blockMs: number;
  failClosed: boolean;
}>;
