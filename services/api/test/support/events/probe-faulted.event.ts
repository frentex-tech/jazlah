import { DomainEvent } from '@common/events/domain-event';

/** Test-only event with one subscriber that throws and one that does not. */
export class ProbeFaultedEvent extends DomainEvent<'probes.probe.faulted'> {
  static readonly eventName = 'probes.probe.faulted';

  constructor(readonly probeId: string) {
    super();
  }
}
