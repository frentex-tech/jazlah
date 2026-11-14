import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { OnDomainEvent } from '@infra/event-bus/on-domain-event.decorator';
import { buildJobId } from '@infra/queue/build-job-id';
import { EventTrace } from './event-trace';
import { EVENT_PROBE_QUEUE } from './event-probe-queue.constants';
import { ProbeCompletedEvent } from './probe-completed.event';

/**
 * The pattern for an effect that must happen: the subscriber only enqueues a job, with
 * a deterministic id built from the event, so the same event delivered twice enqueues
 * one job, and the job does the work with retries.
 */
@Injectable()
export class ProbeCompletedSubscriber {
  constructor(
    @InjectQueue(EVENT_PROBE_QUEUE) private readonly queue: Queue,
    private readonly trace: EventTrace,
  ) {}

  @OnDomainEvent(ProbeCompletedEvent)
  async onProbeCompleted(event: ProbeCompletedEvent): Promise<void> {
    await this.queue.add(
      'probe-follow-up',
      { probeId: event.probeId },
      { jobId: buildJobId('probe-follow-up', event.probeId) },
    );
    this.trace.add(`enqueued:${event.probeId}`);
  }
}
