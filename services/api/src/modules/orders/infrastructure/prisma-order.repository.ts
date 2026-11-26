import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CalendarDate } from '@common/time/calendar-date.type';
import { DbContext } from '@infra/database/db-context';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { Order } from '../domain/order.type';
import type { OrderDraft } from '../domain/order-draft.type';
import type { OrderRepository } from '../domain/ports/order.repository.port';
import { OrderMapper } from './order.mapper';

const WITH_DETAILS = {
  items: { orderBy: { position: 'asc' } },
  history: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.OrderInclude;

/** `OrderRepository` on tables `orders`, `order_items`, `order_status_history` and `order_number_counters`. */
@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly db: DbContext) {}

  async nextSequence(day: CalendarDate): Promise<number> {
    const rows = await this.query(
      () => this.db.client.$queryRaw<{ lastValue: number }[]>`
        INSERT INTO "order_number_counters" ("day", "last_value")
        VALUES (${day}::date, 1)
        ON CONFLICT ("day") DO UPDATE
          SET "last_value" = "order_number_counters"."last_value" + 1
        RETURNING "last_value" AS "lastValue"`,
    );
    const row = rows[0];
    if (row === undefined) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error('The order number counter answered nothing'),
      });
    }
    return row.lastValue;
  }

  async create(draft: OrderDraft): Promise<Order> {
    const row = await this.query(() =>
      this.db.client.order.create({
        data: OrderMapper.toCreateData(draft),
        include: WITH_DETAILS,
      }),
    );
    return OrderMapper.toOrder(row);
  }

  async findOfCustomer(userId: string, id: string): Promise<Order | null> {
    const row = await this.query(() =>
      this.db.client.order.findFirst({
        where: { id, userId },
        include: WITH_DETAILS,
      }),
    );
    return row === null ? null : OrderMapper.toOrder(row);
  }

  private async query<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
