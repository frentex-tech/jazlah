// lint-rule: R19 conforms
import { Throttle } from '@nestjs/throttler';

export const RateLimit = (limit: number): MethodDecorator & ClassDecorator =>
  Throttle({ default: { limit, ttl: 60_000 } });
