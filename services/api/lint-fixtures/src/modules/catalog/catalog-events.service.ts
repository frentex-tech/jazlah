// lint-rule: R16 conforms
import { EventPublisher } from '@infra/event-bus/event-publisher';

/** A module publishes through the wrapper, not the package. */
export class CatalogEventsService {
  constructor(private readonly events: EventPublisher) {}

  productChanged(productId: string): void {
    this.events.publish('catalog.product.changed', { productId });
  }
}
