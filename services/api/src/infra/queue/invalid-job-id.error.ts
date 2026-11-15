/**
 * Thrown by `buildJobId` when it is called wrongly (a bad operation name, or no part).
 * A programming error, found by the first test that enqueues: never sent to a client.
 */
export class InvalidJobIdError extends Error {
  constructor(reason: string) {
    super(`Invalid job id: ${reason}`);
    this.name = 'InvalidJobIdError';
  }
}
