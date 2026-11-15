import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import { InvalidRateLimitOptionsError } from './invalid-rate-limit-options.error';
import { resolveRateLimitPolicy } from './resolve-rate-limit-policy';
import { toRateLimitDeclaration } from './to-rate-limit-declaration';

const LIMITS: ConfiguredRateLimits = {
  otpRequestAddress: { limit: 30, windowMs: 600_000 },
  otpVerifyAddress: { limit: 31, windowMs: 600_000 },
  otpRequestPhone: { limit: 3, windowMs: 600_000 },
  otpRequestPhoneDaily: { limit: 10, windowMs: 86_400_000 },
};

describe('toRateLimitDeclaration and resolveRateLimitPolicy', () => {
  it('keeps numbers written in the decorator as they are', () => {
    const declaration = toRateLimitDeclaration({
      name: 'otp-request',
      limit: 5,
      windowMs: 60_000,
    });

    expect(resolveRateLimitPolicy(declaration, LIMITS)).toEqual({
      name: 'otp-request',
      limit: 5,
      windowMs: 60_000,
      blockMs: 60_000,
      failClosed: false,
    });
  });

  it('picks the numbers of a configured limit only when it is resolved', () => {
    const from = jest.fn(
      (limits: ConfiguredRateLimits) => limits.otpVerifyAddress,
    );
    const declaration = toRateLimitDeclaration({
      name: 'otp-verify',
      failClosed: true,
      from,
    });

    expect(from).not.toHaveBeenCalled();
    expect(resolveRateLimitPolicy(declaration, LIMITS)).toEqual({
      name: 'otp-verify',
      limit: 31,
      windowMs: 600_000,
      blockMs: 600_000,
      failClosed: true,
    });
  });

  it('refuses a bad name when the file loads, configured or not', () => {
    expect(() =>
      toRateLimitDeclaration({
        name: 'OTP Request',
        from: (limits) => limits.otpRequestAddress,
      }),
    ).toThrow(InvalidRateLimitOptionsError);
  });

  it('validates configured numbers like written ones', () => {
    const declaration = toRateLimitDeclaration({
      name: 'otp-request',
      from: () => ({ limit: 0, windowMs: 60_000 }),
    });

    expect(() => resolveRateLimitPolicy(declaration, LIMITS)).toThrow(
      InvalidRateLimitOptionsError,
    );
  });
});
