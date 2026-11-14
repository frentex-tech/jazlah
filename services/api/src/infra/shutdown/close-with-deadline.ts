import { closingResources } from './closing-resources.storage';
import type { CloseWithDeadlineOptions } from './close-with-deadline-options.type';
import {
  SHUTDOWN_DEADLINE_EXIT_CODE,
  SHUTDOWN_FAILED_EXIT_CODE,
} from './shutdown.constants';

/**
 * Runs `close` (the application's close) under an overall deadline. If the deadline
 * passes first, logs at error the resources still closing (`closingResources`) and
 * exits with SHUTDOWN_DEADLINE_EXIT_CODE, so one resource that never finishes (a BullMQ
 * worker after a Redis reconnect was seen to) cannot hold a deploy until the
 * orchestrator kills the process. If `close` throws, logs it and exits with
 * SHUTDOWN_FAILED_EXIT_CODE.
 *
 * While `close` runs, the timer keeps the process alive, so a close stuck on a promise
 * with nothing else open still reaches the deadline instead of exiting with code 0.
 * After a clean close the timer is left running, unreferenced: the process then exits
 * by itself, and if something still keeps it alive, the deadline ends it.
 */
export async function closeWithDeadline(
  close: () => Promise<void>,
  options: CloseWithDeadlineOptions,
): Promise<void> {
  const { deadlineMs, logger, exit } = options;
  const resources = options.resources ?? closingResources;
  const startedAt = Date.now();
  const timer = setTimeout(() => {
    logger.error(
      { deadlineMs, stillClosing: resources.list() },
      'Shutdown deadline passed; exiting with resources still closing',
    );
    exit(SHUTDOWN_DEADLINE_EXIT_CODE);
  }, deadlineMs);
  try {
    await close();
  } catch (error) {
    clearTimeout(timer);
    logger.error({ err: error }, 'Shutdown failed');
    exit(SHUTDOWN_FAILED_EXIT_CODE);
    return;
  }
  timer.unref();
  logger.log({ durationMs: Date.now() - startedAt }, 'Shutdown complete');
}
