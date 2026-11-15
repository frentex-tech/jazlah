// lint-rule: R19 violates
import { Controller, Get } from '@nestjs/common';
import * as throttler from '@nestjs/throttler';

@Controller('catalog')
export class UnthrottledCatalogController {
  @Get()
  @throttler.SkipThrottle()
  list(): string[] {
    return [];
  }
}
