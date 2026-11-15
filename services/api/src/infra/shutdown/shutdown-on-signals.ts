import type { INestApplicationContext } from '@nestjs/common';
import { SHUTDOWN_SIGNALS } from '@infra/health/health.constants';
import { closeWithDeadline } from './close-with-deadline';
import type { CloseWithDeadlineOptions } from './close-with-deadline-options.type';

/**
 * Closes the application on SIGTERM or SIGINT, once, under the shutdown deadline
 * (`closeWithDeadline`). Used by main.ts in place of Nest's `enableShutdownHooks`,
 * which waits for the close without limit.
 */
export function shutdownOnSignals(
  app: INestApplicationContext,
  options: CloseWithDeadlineOptions,
): void {
  let started = false;
  for (const signal of SHUTDOWN_SIGNALS) {
    process.on(signal, () => {
      if (started) {
        return;
      }
      started = true;
      void closeWithDeadline(() => app.close(), options);
    });
  }
}
