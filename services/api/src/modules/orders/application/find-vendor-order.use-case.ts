import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Order } from '../domain/order.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** An order of the store, or NOT_FOUND (the order of another store is not found either). Reads only. */
@Injectable()
export class FindVendorOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(vendorId: string, orderId: string): Promise<Order> {
    const order = await this.orders.findOfVendor(vendorId, orderId);
    if (order === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return order;
  }
}
