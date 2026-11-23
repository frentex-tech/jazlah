/**
 * Thrown by `EventPublisher.publish` when the class has no static `eventName`, or the
 * event is not an instance of it. The types refuse both (`DomainEventClass`); this
 * guards a cast. A programming error: never sent to a client.
 */
export class InvalidEventError extends Error {
  constructor(className: string, eventClassName: string) {
    super(
      `Cannot publish a ${eventClassName} as ${className}: give the event's own class, with a static eventName`,
    );
    this.name = 'InvalidEventError';
  }
}
