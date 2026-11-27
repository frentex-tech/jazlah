import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { OrderScope } from '../domain/order-scope.type';
import type { OrderSummary } from '../domain/order-summary.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** One page of the customer's own orders, newest first; `scope` picks the `current` or the `past` tab, none: both. */
@Injectable()
export class ListCustomerOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  execute(
    userId: string,
    scope: OrderScope | undefined,
    page: PageRequest,
  ): Promise<Page<OrderSummary>> {
    return this.orders.list({ userId, scope }, page);
  }
}
