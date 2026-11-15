// lint-rule: R16 conforms
import { EventEmitter2 } from '@nestjs/event-emitter';

/** Stand-in for the real EventPublisher: inside src/infra/event-bus, the package is allowed. */
export class EventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  publish(name: string, event: object): void {
    this.emitter.emit(name, event);
  }
}
