import { Inject, Injectable } from '@nestjs/common';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_SETTINGS,
  type CartSettingsSource,
} from '../domain/ports/cart-settings.port';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '../domain/ports/cart.repository.port';
import { CartPricer } from './cart-pricer';

/**
 * Removes a line (DELETE /v1/customer/cart/items/{id}); the last one leaves the cart
 * without a store. Refused: ORDERING_PAUSED; NOT_FOUND for a line not in the cart.
 */
@Injectable()
export class RemoveCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(CART_SETTINGS) private readonly settings: CartSettingsSource,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    private readonly pricer: CartPricer,
  ) {}

  async execute(userId: string, lineId: string): Promise<PricedCart> {
    assertOrderingOpen(await this.settings.current());
    await this.transactions.run(async () => {
      const cart = await this.carts.lockForWrite(userId);
      cart.remove(lineId);
      await this.carts.save(cart);
    });
    return this.pricer.price(await this.carts.findByUser(userId), userId);
  }
}
