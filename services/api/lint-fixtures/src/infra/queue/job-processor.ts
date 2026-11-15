// lint-rule: R17 conforms
import { WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

/** Stand-in for the real JobProcessor: inside src/infra/queue, WorkerHost may be extended. */
export abstract class JobProcessor<Data = unknown> extends WorkerHost {
  protected abstract handle(job: Job<Data>): Promise<void>;

  process(job: Job<Data>): Promise<void> {
    return this.handle(job);
  }
}
