// lint-rule: R8 conforms
import { AppError } from '@common/errors/app-error';
import type { OrderStatus } from './order-status.type';

export class Order {
  constructor(readonly status: OrderStatus) {}

  cancel(): Order {
    if (this.status !== 'pending') {
      throw new AppError('ORDER_NOT_CANCELLABLE');
    }
    return new Order('cancelled');
  }
}
