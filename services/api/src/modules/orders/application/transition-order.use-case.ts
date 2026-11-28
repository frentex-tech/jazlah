import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CLOCK, type Clock } from '@common/time/clock.port';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { EventPublisher } from '@infra/event-bus/event-publisher';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CapacityService } from '@modules/scheduling';
import { OrderStatusChangedEvent } from '../domain/events/order-status-changed.event';
import type { Order } from '../domain/order.type';
import type { OrderStatus } from '../domain/order-status.type';
import type { OrderTransitionActor } from '../domain/order-transition-actor.type';
import { ORDER_AUDIT } from '../domain/order-audit-actions.constants';
import { orderTransitionRuleFor } from '../domain/order-state-machine';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../domain/ports/order.repository.port';

/**
 * Moves an order under its row lock. Capacity release, the status update, and its one
 * history row share a transaction; the status event is published inside that
 * transaction and delivered only after the commit.
 */
@Injectable()
export class TransitionOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: Pick<
      OrderRepository,
      'lockForWrite' | 'transition'
    >,
    @Inject(CapacityService)
    private readonly capacity: Pick<CapacityService, 'release'>,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    @Inject(EventPublisher)
    private readonly events: Pick<EventPublisher, 'publish'>,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
  ) {}

  execute(
    orderId: string,
    to: OrderStatus,
    actor: OrderTransitionActor,
    note: string | null = null,
  ): Promise<Order> {
    return this.transactions.run(async () => {
      const order = await this.orders.lockForWrite(
        orderId,
        actor.type === 'vendor' ? actor.vendorId : undefined,
      );
      if (order === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      const rule = orderTransitionRuleFor(
        order.status,
        to,
        order.fulfilment,
        actor.type,
      );
      if (rule === null) {
        throw new AppError(ErrorCode.ORDER_TRANSITION_NOT_ALLOWED, {
          details: { from: order.status, to },
        });
      }
      if (to === 'cancelled' && (note === null || note.trim().length === 0)) {
        throw new AppError(ErrorCode.VALIDATION_FAILED, {
          details: [{ field: 'note', constraints: ['isNotEmpty'] }],
        });
      }

      const at = this.nextTimestamp(order);
      const updated = await this.orders.transition({
        orderId: order.id,
        from: order.status,
        to,
        actorType: actor.type,
        actorId: actor.id,
        note,
        at,
      });
      if (actor.type === 'admin') {
        await this.audit.write({
          actorId: actor.id,
          ...ORDER_AUDIT.statusTransitioned,
          entityId: order.id,
          metadata: { from: order.status, to },
        });
      }
      this.events.publish(
        OrderStatusChangedEvent,
        new OrderStatusChangedEvent(
          updated.id,
          updated.vendorId,
          updated.userId,
          order.status,
          updated.status,
          actor.type,
          at,
        ),
      );
      return updated;
    });
  }

  /**
   * Keep history order stable when two transitions share a millisecond (notably the
   * system auto-confirmation inside placement), while reusing one timestamp for the
   * update, its history row, and its event.
   */
  private nextTimestamp(order: Order): Date {
    const now = this.clock.now();
    const last = order.history.at(-1);
    if (last !== undefined && now.getTime() <= last.at.getTime()) {
      return new Date(last.at.getTime() + 1);
    }
    return now;
  }
}
