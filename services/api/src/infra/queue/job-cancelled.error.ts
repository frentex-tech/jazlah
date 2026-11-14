/**
 * Why a job stopped before its work finished: its abort signal fired (the worker was
 * still busy when the shutdown timeout ran out). BullMQ counts it as a failed attempt
 * and retries the job as usual. Internal: never sent to a client.
 */
export class JobCancelledError extends Error {
  constructor(reason: unknown) {
    super(`Job cancelled: ${typeof reason === 'string' ? reason : 'aborted'}`);
    this.name = 'JobCancelledError';
  }
}
