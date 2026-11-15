import { DomainEvent } from '@common/events/domain-event';

/** Test-only event whose subscriber enqueues a job with a deterministic id. */
export class ProbeCompletedEvent extends DomainEvent<'probes.probe.completed'> {
  static readonly eventName = 'probes.probe.completed';

  constructor(readonly probeId: string) {
    super();
  }
}
