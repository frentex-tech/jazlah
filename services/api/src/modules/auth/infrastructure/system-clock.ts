import { Injectable } from '@nestjs/common';
import type { Clock } from '../domain/ports/clock.port';

/** The system's time. */
@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
