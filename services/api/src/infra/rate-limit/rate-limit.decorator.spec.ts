import { Controller, Get } from '@nestjs/common';
import { InvalidRateLimitOptionsError } from '@common/decorators/invalid-rate-limit-options.error';
import { RateLimit } from './rate-limit.decorator';

const VALID = { name: 'otp-request', limit: 5, windowMs: 60_000 };

describe('RateLimit', () => {
  it('makes the decorator throw when the controller file loads', () => {
    expect(() => {
      @Controller('bad')
      class BadController {
        @Get()
        @RateLimit({ ...VALID, windowMs: 0 })
        handle(): void {}
      }
      return BadController;
    }).toThrow(InvalidRateLimitOptionsError);
  });
});
