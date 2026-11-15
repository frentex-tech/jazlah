import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';

/** Code requests per phone and audience in the short window (AUTH_OTP_PHONE_LIMIT per AUTH_OTP_PHONE_WINDOW_SECONDS). */
export const OTP_REQUEST_PHONE_LIMIT: RateLimitOptions = {
  name: 'otp-request-phone',
  failClosed: true,
  from: (limits) => limits.otpRequestPhone,
};

/** Customer code requests per phone per day (AUTH_OTP_PHONE_DAILY_LIMIT); staff audiences have none. */
export const OTP_REQUEST_PHONE_DAILY_LIMIT: RateLimitOptions = {
  name: 'otp-request-phone-daily',
  failClosed: true,
  from: (limits) => limits.otpRequestPhoneDaily,
};
