import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { Cart } from '../domain/cart.entity';
import type { CartRepository } from '../domain/ports/cart.repository.port';
import { CartMapper } from './cart.mapper';

const WITH_ITEMS = {
  items: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.CartInclude;

/** `CartRepository` on tables `carts` and `cart_items`. */
@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly db: DbContext) {}

  async findByUser(userId: string): Promise<Cart | null> {
    const row = await this.query(() =>
      this.db.client.cart.findUnique({
        where: { userId },
        include: WITH_ITEMS,
      }),
    );
    return row === null ? null : CartMapper.toEntity(row);
  }

  /**
   * Makes the cart when there is none (`ON CONFLICT DO NOTHING`, so two first writes do
   * not collide), then locks its row and reads it under the lock.
   */
  async lockForWrite(userId: string): Promise<Cart> {
    await this.query(
      () => this.db.client.$executeRaw`
        INSERT INTO "carts" ("user_id", "updated_at") VALUES (${userId}::uuid, now())
        ON CONFLICT ("user_id") DO NOTHING`,
    );
    await this.query(
      () => this.db.client.$queryRaw`
        SELECT "id" FROM "carts" WHERE "user_id" = ${userId}::uuid FOR UPDATE`,
    );
    const row = await this.query(() =>
      this.db.client.cart.findUnique({
        where: { userId },
        include: WITH_ITEMS,
      }),
    );
    if (row === null) {
      // Inserted or found above, in this transaction: unreachable.
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error('The cart vanished under its lock'),
      });
    }
    return CartMapper.toEntity(row);
  }

  /** Call after `lockForWrite`, in its transaction. */
  async save(cart: Cart): Promise<void> {
    const client = this.db.client;
    const saved = await this.query(() =>
      client.cart.update({
        where: { userId: cart.userId },
        data: { vendorId: cart.vendorId },
        select: { id: true, items: { select: { id: true } } },
      }),
    );
    const kept = new Set(
      cart.lines.flatMap((line) => (line.id === null ? [] : [line.id])),
    );
    const gone = saved.items
      .map((item) => item.id)
      .filter((id) => !kept.has(id));
    if (gone.length > 0) {
      await this.query(() =>
        client.cartItem.deleteMany({ where: { id: { in: gone } } }),
      );
    }
    for (const line of cart.lines) {
      const data = CartMapper.toItemData(line);
      await this.query(() =>
        line.id === null
          ? client.cartItem.create({ data: { ...data, cartId: saved.id } })
          : client.cartItem.update({ where: { id: line.id }, data }),
      );
    }
  }

  private async query<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
