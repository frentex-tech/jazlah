import type { RateLimitConfig } from './rate-limit-config.type';

/**
 * The rate limits whose numbers come from the environment, by name. `@RateLimit` and
 * `RateLimiter` callers pick one: `from: (limits) => limits.otpRequestAddress`.
 */
export type ConfiguredRateLimits = RateLimitConfig['configured'];
