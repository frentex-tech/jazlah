/** Injection token of DetachedWork. */
export const DETACHED_WORK = Symbol('DETACHED_WORK');

/**
 * Work a request starts but does not wait for. The implementation keeps track of what
 * is still running, so a shutdown waits for it instead of cutting it off.
 */
export interface DetachedWork {
  /**
   * Starts `work` and returns at once. `work` handles its own failures: a rejection is
   * logged, never thrown to anyone.
   */
  start(name: string, work: () => Promise<void>): void;
}
