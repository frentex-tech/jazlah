import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `auth` namespace: the keys that sign access tokens (the current one, and the
 * previous one while a rotation is under way), the secret that hashes verification
 * codes and phone-number rate limit keys, the lifetimes of tokens and codes, and the
 * review accounts. Inject with `@Inject(authConfig.KEY) config: AuthConfig`.
 */
export const authConfig = registerAs('auth', () => {
  const env = loadEnv();
  return {
    accessTokenKey: {
      id: env.AUTH_ACCESS_TOKEN_KEY_ID,
      secret: env.AUTH_ACCESS_TOKEN_SECRET,
    },
    previousAccessTokenKey:
      env.AUTH_ACCESS_TOKEN_PREVIOUS_SECRET === undefined ||
      env.AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID === undefined
        ? undefined
        : {
            id: env.AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID,
            secret: env.AUTH_ACCESS_TOKEN_PREVIOUS_SECRET,
          },
    accessTokenTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
    otpSecret: env.AUTH_OTP_SECRET,
    otpTtlSeconds: env.AUTH_OTP_TTL_SECONDS,
    otpMaxAttempts: env.AUTH_OTP_MAX_ATTEMPTS,
    otpLength: env.AUTH_OTP_LENGTH,
    otpResendWaitSeconds: env.AUTH_OTP_RESEND_WAIT_SECONDS,
    reviewAccounts: env.AUTH_REVIEW_ACCOUNTS,
  };
});
