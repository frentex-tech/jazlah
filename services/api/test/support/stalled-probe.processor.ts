import { Processor } from '@nestjs/bullmq';
import { JobProcessor } from '@infra/queue/job-processor';
import {
  PROBE_QUEUES,
  STALLED_PROBE_WORKER_OPTIONS,
} from './queue-probe.constants';

/**
 * A test-only processor for the stalled-job test. The test takes the job with another
 * worker that never renews its lock, so this worker finds it stalled and BullMQ fails it
 * (maxStalledCount 0) without ever calling `handle`. `handled` counts the calls anyway.
 */
@Processor(PROBE_QUEUES.stalled, STALLED_PROBE_WORKER_OPTIONS)
export class StalledProbeProcessor extends JobProcessor<unknown, void> {
  handled = 0;

  protected handle(): Promise<void> {
    this.handled += 1;
    return Promise.resolve();
  }
}
