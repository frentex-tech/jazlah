import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import { firstRefusal } from '../domain/first-refusal';
import type { LineChoice } from '../domain/line-choice.type';
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
 * Adds a choice to the customer's cart at today's price (POST /v1/customer/cart/items).
 * Refused, nothing changed: ORDERING_PAUSED; the first of the catalog's refusals
 * (PRODUCT_UNAVAILABLE, OPTION_NOT_IN_PRODUCT, SIZE_UNAVAILABLE,
 * INCOMPATIBLE_CUTTING_PACKAGING, OPTION_REQUIRED); CART_VENDOR_MISMATCH unless
 * `replaceCart`; VALIDATION_FAILED past 99 of one choice. The cart row is locked
 * for the write; the catalog is read before (reads only, no lock).
 */
@Injectable()
export class AddCartItemUseCase {
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
    item: Readonly<{ choice: LineChoice; quantity: number }>,
    replaceCart: boolean,
  ): Promise<PricedCart> {
    assertOrderingOpen(await this.settings.current());
    const [quote] = await this.catalog.quote([
      { ...item.choice, quantity: item.quantity },
    ]);
    const refusal = firstRefusal(quote.refusals);
    if (refusal !== null) {
      throw new AppError(ErrorCode[refusal]);
    }
    if (quote.vendorId === null || quote.display === null) {
      throw new AppError(ErrorCode.PRODUCT_UNAVAILABLE);
    }
    const vendorId = quote.vendorId;
    const display = quote.display;
    const cart = await this.transactions.run(async () => {
      const locked = await this.carts.lockForWrite(userId);
      locked.add(
        {
          choice: item.choice,
          quantity: item.quantity,
          unitPrice: quote.unitPrice,
          vendorId,
          display,
        },
        {
          replaceCart,
          currentVendorName: locked.lines[0]?.display.vendorName ?? null,
        },
      );
      await this.carts.save(locked);
      return locked;
    });
    return this.pricer.price(await this.carts.findByUser(cart.userId), userId);
  }
}
