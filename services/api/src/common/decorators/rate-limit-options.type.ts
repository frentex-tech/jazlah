import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import type { RateLimitSettings } from './rate-limit-settings.type';

/**
 * A stricter limit for one endpoint (`@RateLimit`), or one counter of `RateLimiter`.
 * Its numbers are either written here (`limit`, `windowMs`, `blockMs`) or picked from
 * configuration with `from`, never both.
 */
export type RateLimitOptions = Readonly<{
  /**
   * The counter's name, lowercase words joined by dashes or dots (`otp-request`). Every
   * endpoint declaring the same name shares one counter per client address, and must
   * declare the same settings: startup fails otherwise.
   */
  name: string;
  /**
   * While the rate limit storage (Redis) is unavailable, refuse the endpoint's requests
   * with 503 SERVICE_UNAVAILABLE instead of letting them through unlimited. For
   * endpoints where an unlimited request costs money or is a security risk, starting
   * with OTP (`.claude/DECISIONS.md`, "Sensitive endpoints fail closed"). Default: false.
   */
  failClosed?: boolean;
}> &
  (
    | (RateLimitSettings & Readonly<{ from?: undefined }>)
    | Readonly<{
        /**
         * Picks the numbers from the limits the environment configures
         * (`rateLimit.configured`): `from: (limits) => limits.otpRequestAddress`. Read
         * when the application starts, never when the file loads, so the OpenAPI
         * document and the decorators stay independent of configuration.
         */
        from: (limits: ConfiguredRateLimits) => RateLimitSettings;
        limit?: undefined;
        windowMs?: undefined;
        blockMs?: undefined;
      }>
  );
