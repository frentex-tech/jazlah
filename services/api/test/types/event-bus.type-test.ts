/**
 * Compile-time tests of the event bus types, checked by `pnpm test:types` (tsc over the
 * whole project). Nothing here runs.
 *
 * Every line marked `@ts-expect-error` must fail to compile: if a change to the event
 * bus lets one of them compile, tsc fails with "Unused '@ts-expect-error' directive".
 * The unmarked lines must compile. So the file passes only while the types reject
 * exactly what they should.
 */
import { DomainEvent } from '@common/events/domain-event';
import type { EventPublisher } from '@infra/event-bus/event-publisher';
import { OnDomainEvent } from '@infra/event-bus/on-domain-event.decorator';
import { ProbeFaultedEvent } from '../support/events/probe-faulted.event';
import { ProbeHappenedEvent } from '../support/events/probe-happened.event';

declare const events: EventPublisher;

// --- Publishing -------------------------------------------------------------------

// A declared event, with its own class, is accepted.
events.publish(ProbeHappenedEvent, new ProbeHappenedEvent('probe-1'));

// A plain object with the same fields is not an event. (A variable, not a literal, so
// the brand is tested and not TypeScript's excess-property check.)
const lookalike = { probeId: 'probe-1' };
// @ts-expect-error -- not a DomainEvent: lacks the private brand
events.publish(ProbeHappenedEvent, lookalike);
// Not even an empty object.
// @ts-expect-error -- not a DomainEvent: lacks the private brand
events.publish(ProbeHappenedEvent, {});

/** Looks exactly like ProbeHappenedEvent, static name included, but is not a DomainEvent. */
export class LooksLikeAnEvent {
  static readonly eventName = 'probes.probe.happened';
  constructor(readonly probeId: string) {}
}
// @ts-expect-error -- a class that is not a DomainEvent is refused even with the same shape
events.publish(LooksLikeAnEvent, new LooksLikeAnEvent('probe-1'));

/** A DomainEvent whose static name differs from the name in its type. */
export class MismatchedNameEvent extends DomainEvent<'probes.probe.renamed'> {
  static readonly eventName = 'probes.probe.other';
}
// @ts-expect-error -- the class's static eventName is not the name its type declares
events.publish(MismatchedNameEvent, new MismatchedNameEvent());

/** A DomainEvent with no static name at all. */
export class UnnamedEvent extends DomainEvent<'probes.probe.unnamed'> {}
// @ts-expect-error -- the class has no static eventName
events.publish(UnnamedEvent, new UnnamedEvent());

// @ts-expect-error -- an event published under another event's class
events.publish(ProbeHappenedEvent, new ProbeFaultedEvent('probe-1'));

// @ts-expect-error -- the class is required: an event alone cannot be checked
events.publish(new ProbeHappenedEvent('probe-1'));

// --- Subscribing --------------------------------------------------------------------

/** A subscriber whose parameter is the event it subscribes to: accepted. */
export class MatchingSubscriber {
  @OnDomainEvent(ProbeHappenedEvent)
  onProbeHappened(event: ProbeHappenedEvent): void {
    void event;
  }
}

/** ProbeFaultedEvent has the same fields as ProbeHappenedEvent; the name tells them apart. */
export class WrongPayloadSubscriber {
  // @ts-expect-error -- subscribed to probes.probe.happened, takes probes.probe.faulted
  @OnDomainEvent(ProbeHappenedEvent)
  onProbeHappened(event: ProbeFaultedEvent): void {
    void event;
  }
}

export class SubscribesByName {
  // @ts-expect-error -- a subscription names an event class, never a string
  @OnDomainEvent('probes.probe.happened')
  onProbeHappened(event: ProbeHappenedEvent): void {
    void event;
  }
}

// --- Declaring events ---------------------------------------------------------------

export class SubscribesToMismatchedName {
  // @ts-expect-error -- the class's static eventName is not the name its type declares
  @OnDomainEvent(MismatchedNameEvent)
  onRenamed(event: MismatchedNameEvent): void {
    void event;
  }
}

// @ts-expect-error -- an event name has three parts: domain.entity.action
export class OnePartNameEvent extends DomainEvent<'placed'> {
  static readonly eventName = 'placed';
}
