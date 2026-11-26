import { Injectable } from '@nestjs/common';
import type { Clock } from './clock.port';

/** The machine's clock: `{ provide: CLOCK, useClass: SystemClock }` in a module's providers. */
@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
