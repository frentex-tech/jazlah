import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The `rateLimit` namespace: the default limit applied to every endpoint, the
 * pre-routing limit applied to every request, both per client address and window, and
 * `configured`, the named limits whose numbers come from the environment (a
 * `@RateLimit` or a `RateLimiter` caller picks one with `from`).
 * Inject with `@Inject(rateLimitConfig.KEY) config: RateLimitConfig`.
 */
export const rateLimitConfig = registerAs('rateLimit', () => {
  const env = loadEnv();
  const otpAddressWindowMs = env.AUTH_OTP_ADDRESS_WINDOW_SECONDS * 1000;
  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    preRoutingMaxRequests: env.RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS,
    configured: {
      /** Verification code requests per client address. */
      otpRequestAddress: {
        limit: env.AUTH_OTP_REQUEST_ADDRESS_LIMIT,
        windowMs: otpAddressWindowMs,
      },
      /** Verification attempts per client address. */
      otpVerifyAddress: {
        limit: env.AUTH_OTP_VERIFY_ADDRESS_LIMIT,
        windowMs: otpAddressWindowMs,
      },
      /** Verification code requests per phone number, short window. */
      otpRequestPhone: {
        limit: env.AUTH_OTP_PHONE_LIMIT,
        windowMs: env.AUTH_OTP_PHONE_WINDOW_SECONDS * 1000,
      },
      /** Verification code requests per phone number, per day. */
      otpRequestPhoneDaily: {
        limit: env.AUTH_OTP_PHONE_DAILY_LIMIT,
        windowMs: DAY_MS,
      },
    },
  };
});
