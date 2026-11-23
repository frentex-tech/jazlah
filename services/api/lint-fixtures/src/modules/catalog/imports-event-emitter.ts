// lint-rule: R16 violates
import { OnEvent } from '@nestjs/event-emitter';

export class CatalogListener {
  @OnEvent('orders.order.placed')
  onOrderPlaced(): void {}
}
