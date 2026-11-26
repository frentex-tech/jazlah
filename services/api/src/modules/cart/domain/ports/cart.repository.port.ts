import type { Cart } from '../cart.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

/** Where carts are kept (table `carts` and `cart_items`). */
export interface CartRepository {
  /** The customer's cart, or null when they have none. */
  findByUser(userId: string): Promise<Cart | null>;

  /**
   * The customer's cart with its row locked for the rest of the transaction, made first
   * when they have none (modules.md: a write to an aggregate locks its root row).
   * Call inside `TransactionRunner.run`.
   */
  lockForWrite(userId: string): Promise<Cart>;

  /** Saves the cart's store and lines: new lines added, changed ones updated, missing ones deleted. */
  save(cart: Cart): Promise<void>;
}
