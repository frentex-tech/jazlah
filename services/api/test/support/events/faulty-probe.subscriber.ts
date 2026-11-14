import { Injectable } from '@nestjs/common';
import { OnDomainEvent } from '@infra/event-bus/on-domain-event.decorator';
import { EventTrace } from './event-trace';
import { ProbeFaultedEvent } from './probe-faulted.event';

/** Always throws, after writing to the trace that it ran. */
@Injectable()
export class FaultyProbeSubscriber {
  constructor(private readonly trace: EventTrace) {}

  @OnDomainEvent(ProbeFaultedEvent)
  onProbeFaulted(event: ProbeFaultedEvent): void {
    this.trace.add(`faulty-ran:${event.probeId}`);
    throw new Error('subscriber failure');
  }
}
