import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import type { RateLimitPolicy } from './rate-limit-policy.type';
import type { RateLimitSettings } from './rate-limit-settings.type';

/**
 * What `@RateLimit` stores on an endpoint (RATE_LIMIT_POLICY): a policy whose numbers
 * were written in the decorator, already validated, or one whose numbers are picked
 * from configuration when the application starts (resolveRateLimitPolicy).
 */
export type RateLimitDeclaration =
  | RateLimitPolicy
  | Readonly<{
      name: string;
      failClosed: boolean;
      from: (limits: ConfiguredRateLimits) => RateLimitSettings;
    }>;
