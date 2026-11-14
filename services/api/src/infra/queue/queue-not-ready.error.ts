/**
 * Why adding a job was refused at once: the queue's Redis connection is not connected
 * (never connected yet, or reconnecting after Redis stopped). The cause of the
 * SERVICE_UNAVAILABLE a producer receives. Internal: never sent to a client.
 */
export class QueueNotReadyError extends Error {
  constructor(
    readonly queue: string,
    readonly status: string,
  ) {
    super(
      `Queue "${queue}" is not connected to Redis (status ${status}); the job was not added`,
    );
    this.name = 'QueueNotReadyError';
  }
}
