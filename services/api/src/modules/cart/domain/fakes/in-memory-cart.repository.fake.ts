import { Cart } from '../cart.entity';
import type { CartFulfilment } from '../cart-fulfilment.type';
import type { CartLine } from '../cart-line.type';
import type { CartRepository } from '../ports/cart.repository.port';

type Stored = {
  id: string;
  vendorId: string | null;
  lines: CartLine[];
  fulfilment: CartFulfilment | null;
};

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
        : Cart.restore(
            stored.id,
            userId,
            stored.vendorId,
            stored.lines,
            stored.fulfilment,
          ),
    );
  }

  lockForWrite(userId: string): Promise<Cart> {
    this.locks += 1;
    if (!this.carts.has(userId)) {
      this.carts.set(userId, {
        id: `cart-${this.nextId++}`,
        vendorId: null,
        lines: [],
        fulfilment: null,
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
    stored.fulfilment = cart.fulfilment;
    stored.lines = cart.lines.map((line) => ({
      ...line,
      id: line.id ?? `line-${this.nextId++}`,
    }));
    return Promise.resolve();
  }
}
