import { Queue } from 'bullmq';
import { withTimeout } from '@common/async/with-timeout';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { trackClosing } from '@infra/shutdown/track-closing';
import { QueueNotReadyError } from './queue-not-ready.error';
import { QUEUE_ADD_TIMEOUT_MS } from './queue.constants';

/** The part of BullMQ's Redis client this class reads. */
type ConnectionStatus = { readonly status: string };

/**
 * The queue class of every queue registered with `QueueRegistrationModule.register`
 * (R15). Adding a job (`add`, `addBulk`) is bounded, so a producer never hangs on
 * Redis:
 *
 * - **Not connected** (Redis stopped, the client reconnecting): refused at once, the job
 *   is not sent. Without this, BullMQ waits for the connection without limit.
 * - **Not connected yet** (just after startup): waits for the first connection, within
 *   QUEUE_ADD_TIMEOUT_MS.
 * - **Connected but slow**: the add is given QUEUE_ADD_TIMEOUT_MS.
 *
 * Each failure rejects with AppError SERVICE_UNAVAILABLE (503), the cause naming the
 * reason. After a timeout on a connected Redis the job may still be added later, since
 * the command was already sent: a caller that retries must use `buildJobId`, or the
 * job may run twice. Nothing else on the queue (getters, schedulers) is bounded.
 */
export class BoundedQueue extends Queue {
  private client: ConnectionStatus | undefined;
  private readonly firstConnection: Promise<ConnectionStatus | undefined>;

  constructor(...args: ConstructorParameters<typeof Queue>) {
    super(...args);
    // Resolves once, when the connection is first ready; the client's status is then
    // read on each add, so a later outage is seen at once.
    this.firstConnection = this.getBackend().connection.client.then(
      (client) => {
        this.client = client;
        return client;
      },
      () => undefined,
    );
  }

  /** Closing is recorded for the shutdown deadline, which names a queue that never closes. */
  override close(): Promise<void> {
    return trackClosing(`queue ${this.name}`, () => super.close());
  }

  override add(...args: Parameters<Queue['add']>): ReturnType<Queue['add']> {
    return this.bounded(() => super.add(...args));
  }

  override addBulk(
    ...args: Parameters<Queue['addBulk']>
  ): ReturnType<Queue['addBulk']> {
    return this.bounded(() => super.addBulk(...args));
  }

  private async bounded<T>(work: () => Promise<T>): Promise<T> {
    const startedAt = performance.now();
    try {
      const client =
        this.client ??
        (await withTimeout(this.firstConnection, QUEUE_ADD_TIMEOUT_MS));
      if (client?.status !== 'ready') {
        throw new QueueNotReadyError(this.name, client?.status ?? 'closed');
      }
      const remaining = Math.max(
        1,
        QUEUE_ADD_TIMEOUT_MS - (performance.now() - startedAt),
      );
      return await withTimeout(work(), remaining);
    } catch (error) {
      if (error instanceof AppError || !this.isOutage(error)) {
        throw error;
      }
      throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
    }
  }

  /** Whether the add failed because Redis is unavailable, not because of the job. */
  private isOutage(error: unknown): boolean {
    return (
      error instanceof QueueNotReadyError ||
      (error instanceof Error && error.name === 'TimeoutError') ||
      // A connection lost while the command was in flight.
      this.client?.status !== 'ready'
    );
  }
}
