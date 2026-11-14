import type { LoggerService } from '@nestjs/common';

/**
 * Sends a BullMQ queue's or worker's `error` events to the application logger, with the
 * queue name and the error only (never job data). Without a listener BullMQ prints
 * them to the console. Connection errors repeat while Redis is down (BullMQ
 * reconnects with backoff, at most every 20 s), so they are logged at warn.
 */
export function logQueueErrors(
  source: {
    readonly name: string;
    on(event: 'error', listener: (error: Error) => void): unknown;
  },
  logger: Pick<LoggerService, 'warn'>,
): void {
  source.on('error', (error: Error) => {
    logger.warn({ err: error, queue: source.name }, 'Queue connection error');
  });
}
