import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { escapeLikePattern } from '@common/text/escape-like-pattern';
import { toLatinDigits } from '@common/text/to-latin-digits';
import type { CalendarDate } from '@common/time/calendar-date.type';
import { DbContext } from '@infra/database/db-context';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { Order } from '../domain/order.type';
import type { OrderDraft } from '../domain/order-draft.type';
import type { OrderListFilter } from '../domain/order-list-filter.type';
import type { OrderSummary } from '../domain/order-summary.type';
import { PAST_ORDER_STATUSES } from '../domain/past-order-statuses.constants';
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

  async findOfVendor(vendorId: string, id: string): Promise<Order | null> {
    const row = await this.query(() =>
      this.db.client.order.findFirst({
        where: { id, vendorId },
        include: WITH_DETAILS,
      }),
    );
    return row === null ? null : OrderMapper.toOrder(row);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.query(() =>
      this.db.client.order.findUnique({
        where: { id },
        include: WITH_DETAILS,
      }),
    );
    return row === null ? null : OrderMapper.toOrder(row);
  }

  async list(
    filter: OrderListFilter,
    page: PageRequest,
  ): Promise<Page<OrderSummary>> {
    const rows = await this.query(() =>
      this.db.client.order.findMany({
        where: { ...toCondition(filter), ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      }),
    );
    return toPage(
      rows.map((row) => OrderMapper.toSummary(row)),
      page.limit,
    );
  }

  private async query<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

/**
 * The `where` of a list's filters. The scope and the search sit under `AND`, so the `OR`
 * of the search never meets the `OR` of the keyset condition spread beside it. The search
 * is matched, case-insensitively, in the order number, the customer's name and (digits
 * read as Latin) the customer's mobile. No index serves it: it narrows a list the owner,
 * vendor or status filter already bounds.
 */
function toCondition(filter: OrderListFilter): Prisma.OrderWhereInput {
  const { scope, search } = filter;
  const all: Prisma.OrderWhereInput[] = [];
  if (scope !== undefined) {
    const past = [...PAST_ORDER_STATUSES];
    all.push({ status: scope === 'past' ? { in: past } : { notIn: past } });
  }
  if (search !== undefined) {
    all.push({
      OR: [
        {
          number: {
            contains: escapeLikePattern(search),
            mode: 'insensitive',
          },
        },
        {
          customerName: {
            contains: escapeLikePattern(search),
            mode: 'insensitive',
          },
        },
        {
          customerPhone: {
            contains: escapeLikePattern(toLatinDigits(search)),
          },
        },
      ],
    });
  }
  return {
    ...(filter.userId === undefined ? {} : { userId: filter.userId }),
    ...(filter.vendorId === undefined ? {} : { vendorId: filter.vendorId }),
    ...(filter.status === undefined ? {} : { status: filter.status }),
    ...(filter.paymentMethod === undefined
      ? {}
      : { paymentMethod: filter.paymentMethod }),
    ...(filter.fulfilmentDate === undefined
      ? {}
      : { fulfilmentDate: new Date(`${filter.fulfilmentDate}T00:00:00Z`) }),
    ...(all.length === 0 ? {} : { AND: all }),
  };
}
