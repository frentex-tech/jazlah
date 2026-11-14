import { DomainEvent } from '@common/events/domain-event';

/** Test-only event: a probe happened. Carries the probe's id only. */
export class ProbeHappenedEvent extends DomainEvent<'probes.probe.happened'> {
  static readonly eventName = 'probes.probe.happened';

  constructor(readonly probeId: string) {
    super();
  }
}
