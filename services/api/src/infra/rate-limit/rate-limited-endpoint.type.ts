import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';

/** What the startup check knows about one route handler (checkRateLimitPolicies). */
export type RateLimitedEndpoint = Readonly<{
  /** `ControllerClass.method`, as error messages name it. */
  endpoint: string;
  /** `@RateLimit` on the method itself. */
  methodPolicy?: RateLimitPolicy;
  /** `@RateLimit` on the controller class. */
  classPolicy?: RateLimitPolicy;
  /** `@SkipRateLimit` on the controller class. */
  classSkipped: boolean;
}>;
