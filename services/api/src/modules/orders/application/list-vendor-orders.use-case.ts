import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { OrderListFilter } from '../domain/order-list-filter.type';
import type { OrderSummary } from '../domain/order-summary.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** One page of a store's own orders, newest first. The store comes from the caller's token; a `vendorId` in the filter is replaced by it. */
@Injectable()
export class ListVendorOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  execute(
    vendorId: string,
    filter: Omit<OrderListFilter, 'userId' | 'vendorId' | 'scope'>,
    page: PageRequest,
  ): Promise<Page<OrderSummary>> {
    return this.orders.list({ ...filter, vendorId }, page);
  }
}
