import { Controller, Get } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import { SkipRateLimit } from '@infra/rate-limit/skip-rate-limit.decorator';
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

@SkipRateLimit()
@Controller('skipped')
class SkippedController {
  @Get()
  @RateLimit(OTP)
  request(): void {}
}

/** Starts a Nest application with the check and the given controllers. */
async function start(...controllers: (new () => object)[]) {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    controllers,
    providers: [RateLimitPolicyCheck],
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

  it('fails startup on @RateLimit under a class-level @SkipRateLimit', async () => {
    await expect(start(SkippedController)).rejects.toThrow(
      'SkippedController.request has @RateLimit("otp-request") but its controller has @SkipRateLimit',
    );
  });
});
