import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Order } from '../domain/order.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** An order of the customer, or NOT_FOUND (the order of another customer is not found either). Reads only. */
@Injectable()
export class FindCustomerOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(userId: string, orderId: string): Promise<Order> {
    const order = await this.orders.findOfCustomer(userId, orderId);
    if (order === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return order;
  }
}
