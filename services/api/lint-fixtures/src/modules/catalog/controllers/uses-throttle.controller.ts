// lint-rule: R19 violates
import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('catalog')
export class ThrottledCatalogController {
  @Get()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  list(): string[] {
    return [];
  }
}
