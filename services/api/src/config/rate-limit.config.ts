import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `rateLimit` namespace: the default limit applied to every endpoint, and the
 * pre-routing limit applied to every request, both per client address and window.
 * Inject with `@Inject(rateLimitConfig.KEY) config: RateLimitConfig`.
 */
export const rateLimitConfig = registerAs('rateLimit', () => {
  const env = loadEnv();
  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    preRoutingMaxRequests: env.RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS,
  };
});
