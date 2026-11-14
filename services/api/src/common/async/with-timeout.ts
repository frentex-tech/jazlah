import { TimeoutError } from './timeout.error';

/**
 * Settles like `promise`, or rejects with TimeoutError when `ms` pass first. The timer
 * is always cleared. It does not cancel the underlying work.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
