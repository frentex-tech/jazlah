import type { NestExpressApplication } from '@nestjs/platform-express';
import { createHttpApp } from './create-http-app';
import { ProbeController } from './probe.controller';

/** The real application, set up as main.ts does, plus the test-only probe controller. */
export function createProbeApp(): Promise<NestExpressApplication> {
  return createHttpApp({ controllers: [ProbeController] });
}
