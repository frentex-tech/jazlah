import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '@common/time/clock.port';
import { RiyadhCalendar } from '@common/time/riyadh-calendar';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { EventPublisher } from '@infra/event-bus/event-publisher';
import { OrderPlacedEvent } from '../domain/events/order-placed.event';
import { formatOrderNumber } from '../domain/format-order-number';
import { initialStatusFor } from '../domain/initial-status-for';
import type { NewOrder } from '../domain/new-order.type';
import type { Order } from '../domain/order.type';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';
import { priceOrder } from '../domain/price-order';

/**
 * The core that makes an order, whatever its source (ORD-API-1; a cart now, occasions
 * and animals later): numbers it (`JZ-YYMMDD-NNNN`, one atomic counter per Riyadh day),
 * works out its money from the lines with `Money` (`priceOrder`), gives it its first
 * status and its first history row, saves it, and publishes `orders.order.placed`
 * (delivered after the commit, dropped on a rollback).
 *
 * It trusts its caller for everything already checked (prices, day, capacity) and
 * makes no check of its own: that is the caller's use case. It runs in the caller's
 * transaction (a nested `run` joins the open one), so the order and the caller's other
 * writes commit together.
 */
@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    @Inject(EventPublisher)
    private readonly events: Pick<EventPublisher, 'publish'>,
  ) {}

  async execute(request: NewOrder): Promise<Order> {
    if (request.lines.length === 0) {
      throw new RangeError('An order has at least one line');
    }
    return this.transactions.run(async () => {
      const placedAt = this.clock.now();
      const day = RiyadhCalendar.dateOf(placedAt);
      const status = initialStatusFor(request.paymentMethod);
      const sequence = await this.orders.nextSequence(day);
      const order = await this.orders.create({
        number: formatOrderNumber(day, sequence),
        request,
        pricing: priceOrder(request.lines, request.deliveryFee),
        status,
        firstEntry: {
          from: null,
          to: status,
          actorType: 'customer',
          actorId: request.userId,
          note: null,
          at: placedAt,
        },
      });
      this.events.publish(
        OrderPlacedEvent,
        new OrderPlacedEvent(order.id, order.vendorId),
      );
      return order;
    });
  }
}
