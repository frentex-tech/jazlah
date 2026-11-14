import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { checkRateLimitPolicies } from './check-rate-limit-policies';
import { InvalidRateLimitSetupError } from './invalid-rate-limit-setup.error';

const OTP: RateLimitPolicy = {
  name: 'otp-request',
  limit: 5,
  windowMs: 600_000,
  blockMs: 600_000,
  failClosed: true,
};

describe('checkRateLimitPolicies', () => {
  it('accepts endpoints sharing a name with the same settings', () => {
    expect(() =>
      checkRateLimitPolicies([
        {
          endpoint: 'CustomerOtpController.request',
          methodPolicy: OTP,
          classSkipped: false,
        },
        {
          endpoint: 'VendorOtpController.request',
          methodPolicy: { ...OTP },
          classSkipped: false,
        },
      ]),
    ).not.toThrow();
  });

  it('refuses one name with different settings, naming both endpoints', () => {
    expect(() =>
      checkRateLimitPolicies([
        {
          endpoint: 'CustomerOtpController.request',
          methodPolicy: OTP,
          classSkipped: false,
        },
        {
          endpoint: 'VendorOtpController.request',
          methodPolicy: { ...OTP, limit: 10 },
          classSkipped: false,
        },
      ]),
    ).toThrow(
      '@RateLimit("otp-request") is declared with different settings on CustomerOtpController.request (limit 5, windowMs 600000, blockMs 600000, failClosed true) and VendorOtpController.request (limit 10, windowMs 600000, blockMs 600000, failClosed true)',
    );
  });

  it('compares the class-level policy of an endpoint without its own', () => {
    expect(() =>
      checkRateLimitPolicies([
        { endpoint: 'A.one', classPolicy: OTP, classSkipped: false },
        {
          endpoint: 'B.two',
          methodPolicy: { ...OTP, failClosed: false },
          classSkipped: false,
        },
      ]),
    ).toThrow(InvalidRateLimitSetupError);
  });

  it('refuses a method @RateLimit under a class-level @SkipRateLimit', () => {
    expect(() =>
      checkRateLimitPolicies([
        {
          endpoint: 'HealthController.otp',
          methodPolicy: OTP,
          classSkipped: true,
        },
      ]),
    ).toThrow(
      'HealthController.otp has @RateLimit("otp-request") but its controller has @SkipRateLimit',
    );
  });

  it('accepts endpoints without @RateLimit', () => {
    expect(() =>
      checkRateLimitPolicies([
        { endpoint: 'HealthController.check', classSkipped: true },
        { endpoint: 'A.b', classSkipped: false },
      ]),
    ).not.toThrow();
  });
});
