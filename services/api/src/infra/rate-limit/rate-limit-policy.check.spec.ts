import { Controller, Get } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import { SkipRateLimit } from '@infra/rate-limit/skip-rate-limit.decorator';
import { rateLimitConfig } from '@config/rate-limit.config';
import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import { RateLimitPolicyCheck } from './rate-limit-policy.check';

const OTP = { name: 'otp-request', limit: 5, windowMs: 600_000 };

@Controller('customer/otp')
class CustomerOtpController {
  @Get()
  @RateLimit(OTP)
  request(): void {}
}

@Controller('vendor/otp')
class VendorOtpController {
  @Get()
  @RateLimit({ ...OTP, limit: 10 })
  request(): void {}
}

@Controller('vendor/otp-same')
class SameSettingsOtpController {
  @Get()
  @RateLimit(OTP)
  request(): void {}
}

const CONFIGURED: ConfiguredRateLimits = {
  otpRequestAddress: { limit: 5, windowMs: 600_000 },
  otpVerifyAddress: { limit: 30, windowMs: 600_000 },
  otpRequestPhone: { limit: 3, windowMs: 600_000 },
  otpRequestPhoneDaily: { limit: 10, windowMs: 86_400_000 },
};

/** The same counter as OTP, its numbers picked from configuration. */
@Controller('kitchen/otp')
class ConfiguredOtpController {
  @Get()
  @RateLimit({
    name: 'otp-request',
    from: (limits) => limits.otpRequestAddress,
  })
  request(): void {}
}

@SkipRateLimit()
@Controller('skipped')
class SkippedController {
  @Get()
  @RateLimit(OTP)
  request(): void {}
}

/** Starts a Nest application with the check and the given controllers. */
async function start(...controllers: (new () => object)[]) {
  return startWith(CONFIGURED, ...controllers);
}

async function startWith(
  configured: ConfiguredRateLimits,
  ...controllers: (new () => object)[]
) {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    controllers,
    providers: [
      RateLimitPolicyCheck,
      { provide: rateLimitConfig.KEY, useValue: { configured } },
    ],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  try {
    await app.init();
  } finally {
    await app.close();
  }
}

describe('RateLimitPolicyCheck', () => {
  it('fails startup when two endpoints declare one name with different settings', async () => {
    await expect(
      start(CustomerOtpController, VendorOtpController),
    ).rejects.toThrow(
      /@RateLimit\("otp-request"\) is declared with different settings on CustomerOtpController\.request .* and VendorOtpController\.request/,
    );
  });

  it('starts when they declare the same settings', async () => {
    await expect(
      start(CustomerOtpController, SameSettingsOtpController),
    ).resolves.toBeUndefined();
  });

  it('resolves a configured limit before comparing: equal numbers share the counter', async () => {
    await expect(
      start(CustomerOtpController, ConfiguredOtpController),
    ).resolves.toBeUndefined();
  });

  it('fails startup when the configured numbers differ from the written ones', async () => {
    await expect(
      startWith(
        { ...CONFIGURED, otpRequestAddress: { limit: 6, windowMs: 600_000 } },
        CustomerOtpController,
        ConfiguredOtpController,
      ),
    ).rejects.toThrow(/declared with different settings/);
  });

  it('fails startup when a configured limit is not a valid number', async () => {
    await expect(
      startWith(
        { ...CONFIGURED, otpRequestAddress: { limit: 0, windowMs: 600_000 } },
        ConfiguredOtpController,
      ),
    ).rejects.toThrow('limit must be a positive whole number');
  });

  it('fails startup on @RateLimit under a class-level @SkipRateLimit', async () => {
    await expect(start(SkippedController)).rejects.toThrow(
      'SkippedController.request has @RateLimit("otp-request") but its controller has @SkipRateLimit',
    );
  });
});
