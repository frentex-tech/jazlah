import { Cart } from '../cart.entity';
import type { CartLine } from '../cart-line.type';
import type { CartRepository } from '../ports/cart.repository.port';

type Stored = { id: string; vendorId: string | null; lines: CartLine[] };

/** CartRepository in memory: ids are counters; `locks` counts lockForWrite calls. */
export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Stored>();
  private nextId = 1;
  locks = 0;

  findByUser(userId: string): Promise<Cart | null> {
    const stored = this.carts.get(userId);
    return Promise.resolve(
      stored === undefined
        ? null
        : Cart.restore(stored.id, userId, stored.vendorId, stored.lines),
    );
  }

  lockForWrite(userId: string): Promise<Cart> {
    this.locks += 1;
    if (!this.carts.has(userId)) {
      this.carts.set(userId, {
        id: `cart-${this.nextId++}`,
        vendorId: null,
        lines: [],
      });
    }
    return this.findByUser(userId).then((cart) => cart as Cart);
  }

  save(cart: Cart): Promise<void> {
    const stored = this.carts.get(cart.userId);
    if (stored === undefined) {
      throw new Error('save before lockForWrite');
    }
    stored.vendorId = cart.vendorId;
    stored.lines = cart.lines.map((line) => ({
      ...line,
      id: line.id ?? `line-${this.nextId++}`,
    }));
    return Promise.resolve();
  }
}
