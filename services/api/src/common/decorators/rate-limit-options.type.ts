/** A stricter limit for one endpoint (`@RateLimit`). Times are in milliseconds. */
export type RateLimitOptions = Readonly<{
  /**
   * The counter's name, lowercase words joined by dashes or dots (`otp-request`). Every
   * endpoint declaring the same name shares one counter per client address, and must
   * declare the same settings: startup fails otherwise.
   */
  name: string;
  /** Requests allowed per client address in each window. A positive whole number. */
  limit: number;
  /** A positive whole number of milliseconds. */
  windowMs: number;
  /**
   * How long a client that went over stays refused. At least `windowMs`.
   * Default: `windowMs`.
   */
  blockMs?: number;
  /**
   * While the rate limit storage (Redis) is unavailable, refuse the endpoint's requests
   * with 503 SERVICE_UNAVAILABLE instead of letting them through unlimited. For
   * endpoints where an unlimited request costs money or is a security risk, starting
   * with OTP (`.claude/DECISIONS.md`, "Sensitive endpoints fail closed"). Default: false.
   */
  failClosed?: boolean;
}>;
