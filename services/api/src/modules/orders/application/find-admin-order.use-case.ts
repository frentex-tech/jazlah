import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Order } from '../domain/order.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/** Any order, or NOT_FOUND for an unknown one. Reads only. */
@Injectable()
export class FindAdminOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(orderId: string): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (order === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return order;
  }
}
