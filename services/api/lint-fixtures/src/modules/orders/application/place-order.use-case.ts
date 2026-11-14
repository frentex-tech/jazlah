// lint-rule: support
import { Order } from '../domain/order.entity';

export class PlaceOrderUseCase {
  execute(): Order {
    return new Order('pending');
  }
}
