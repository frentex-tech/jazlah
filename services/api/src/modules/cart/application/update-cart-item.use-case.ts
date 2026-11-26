import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_CATALOG,
  type CartCatalog,
} from '../domain/ports/cart-catalog.port';
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
 * Sets a line's quantity at today's price (PATCH /v1/customer/cart/items/{id}): the
 * same quantity accepts a changed price. Refused, nothing changed: ORDERING_PAUSED;
 * NOT_FOUND for a line not in the cart; SIZE_UNAVAILABLE when its size is switched off,
 * PRODUCT_UNAVAILABLE when it can no longer be ordered as chosen for any other reason.
 * The cart row is locked and the line read under the lock.
 */
@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(CART_CATALOG) private readonly catalog: CartCatalog,
    @Inject(CART_SETTINGS) private readonly settings: CartSettingsSource,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    private readonly pricer: CartPricer,
  ) {}

  async execute(
    userId: string,
    lineId: string,
    quantity: number,
  ): Promise<PricedCart> {
    assertOrderingOpen(await this.settings.current());
    await this.transactions.run(async () => {
      const cart = await this.carts.lockForWrite(userId);
      const line = cart.lineOf(lineId);
      const [quote] = await this.catalog.quote([{ ...line.choice, quantity }]);
      if (quote.refusals.length > 0 || quote.display === null) {
        throw new AppError(
          quote.refusals.includes('SIZE_UNAVAILABLE')
            ? ErrorCode.SIZE_UNAVAILABLE
            : ErrorCode.PRODUCT_UNAVAILABLE,
        );
      }
      cart.changeQuantity(lineId, quantity, quote.unitPrice, quote.display);
      await this.carts.save(cart);
    });
    return this.pricer.price(await this.carts.findByUser(userId), userId);
  }
}
