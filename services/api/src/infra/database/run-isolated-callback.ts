import type { LoggerService } from '@nestjs/common';
import type { AfterCommitCallback } from './after-commit-callback.type';

/**
 * Runs one after-commit callback so that nothing it does reaches the caller or the other
 * callbacks: a thrown error and a rejected promise are both logged at error. Never
 * awaited: the committed transaction does not wait for its callbacks.
 */
export function runIsolatedCallback(
  callback: AfterCommitCallback,
  logger: Pick<LoggerService, 'error'>,
): void {
  const fail = (error: unknown): void => {
    logger.error({ err: error }, 'An after-commit callback failed');
  };
  try {
    const result = callback();
    if (result instanceof Promise) {
      result.catch(fail);
    }
  } catch (error) {
    fail(error);
  }
}
