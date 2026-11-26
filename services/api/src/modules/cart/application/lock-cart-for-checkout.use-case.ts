import { Inject, Injectable } from '@nestjs/common';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '../domain/ports/cart.repository.port';
import { CartPricer } from './cart-pricer';

/**
 * The customer's cart for placing an order (ORD-API-1): its row locked for the rest of
 * the transaction (`lockForWrite`, so two placements or a placement and an edit of one
 * cart happen one after the other), read again under the lock and priced now. Call
 * inside `TransactionRunner.run`. Pricing reads the catalog, not the cart's accepted
 * prices: a price that moved shows as a PRICE_CHANGED issue. Placing it does not check
 * whether ordering is paused, nor any issue: that is the caller's.
 */
@Injectable()
export class LockCartForCheckoutUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    private readonly pricer: CartPricer,
  ) {}

  async execute(userId: string): Promise<PricedCart> {
    return this.pricer.price(await this.carts.lockForWrite(userId), userId);
  }
}
