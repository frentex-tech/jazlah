// lint-rule: R19 conforms
import { Controller, Get } from '@nestjs/common';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';

@Controller('catalog')
export class RateLimitedCatalogController {
  @Get()
  @RateLimit(5)
  list(): string[] {
    return [];
  }
}
