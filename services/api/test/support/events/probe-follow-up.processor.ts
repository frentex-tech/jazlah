import { Processor } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { JobProcessor } from '@infra/queue/job-processor';
import { EventTrace } from './event-trace';
import { EVENT_PROBE_QUEUE } from './event-probe-queue.constants';

/** Runs the job ProbeCompletedSubscriber enqueues, and writes each run to the trace. */
@Processor(EVENT_PROBE_QUEUE)
export class ProbeFollowUpProcessor extends JobProcessor<
  { probeId: string },
  void
> {
  constructor(private readonly trace: EventTrace) {
    super();
  }

  protected handle(job: Job<{ probeId: string }, void>): Promise<void> {
    this.trace.add(`job-ran:${job.data.probeId}`);
    return Promise.resolve();
  }
}
