import { Injectable } from '@nestjs/common';
import { OnDomainEvent } from '@infra/event-bus/on-domain-event.decorator';
import { EventTrace } from './event-trace';
import { ProbeFaultedEvent } from './probe-faulted.event';

/** The second subscriber of ProbeFaultedEvent: must run although the first throws. */
@Injectable()
export class HealthyProbeSubscriber {
  constructor(private readonly trace: EventTrace) {}

  @OnDomainEvent(ProbeFaultedEvent)
  onProbeFaulted(event: ProbeFaultedEvent): void {
    this.trace.add(`healthy-ran:${event.probeId}`);
  }
}
