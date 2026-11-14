/** Raised by `withTimeout` when the work did not settle in time. Internal: never sent to a client. */
export class TimeoutError extends Error {
  constructor(readonly ms: number) {
    super(`Timed out after ${ms} ms`);
    this.name = 'TimeoutError';
  }
}
