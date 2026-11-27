import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { OrderListFilter } from '../domain/order-list-filter.type';
import type { OrderSummary } from '../domain/order-summary.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** One page of every order, newest first, narrowed by the admin's filters (`vendorId` included). */
@Injectable()
export class ListAdminOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  execute(
    filter: Omit<OrderListFilter, 'userId' | 'scope'>,
    page: PageRequest,
  ): Promise<Page<OrderSummary>> {
    return this.orders.list(filter, page);
  }
}
