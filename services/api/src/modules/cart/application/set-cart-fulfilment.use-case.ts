import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import type { CartFulfilment } from '../domain/cart-fulfilment.type';
import type { FulfilmentMethod } from '../domain/fulfilment-method.type';
import type { LineFulfilment } from '../domain/line-fulfilment.type';
import { orderTypesOf } from '../domain/order-types-of';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_ADDRESSES,
  type CartAddresses,
} from '../domain/ports/cart-addresses.port';
import {
  CART_CATALOG,
  type CartCatalog,
} from '../domain/ports/cart-catalog.port';
import {
  CART_SCHEDULING,
  type CartScheduling,
} from '../domain/ports/cart-scheduling.port';
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
 * Chooses delivery or pickup and the day (PATCH /v1/customer/cart/fulfilment). Refused,
 * nothing changed, in this order: ORDERING_PAUSED; CART_EMPTY; FULFILMENT_NOT_SUPPORTED
 * (a line's product does not allow the method); for delivery, NOT_FOUND (not one of the
 * customer's addresses) and ADDRESS_NOT_COVERED; DAY_FULL or DAY_NOT_AVAILABLE
 * (`details.reason`) from the scheduling engine. The cart row is locked and read under
 * the lock; no capacity is taken here (placing the order takes it).
 */
@Injectable()
export class SetCartFulfilmentUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(CART_CATALOG) private readonly catalog: CartCatalog,
    @Inject(CART_SETTINGS) private readonly settings: CartSettingsSource,
    @Inject(CART_SCHEDULING) private readonly scheduling: CartScheduling,
    @Inject(CART_ADDRESSES) private readonly addresses: CartAddresses,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    private readonly pricer: CartPricer,
  ) {}

  async execute(
    userId: string,
    request: Readonly<{
      method: FulfilmentMethod;
      addressId: string | null;
      date: string;
    }>,
  ): Promise<PricedCart> {
    assertOrderingOpen(await this.settings.current());
    await this.transactions.run(async () => {
      const cart = await this.carts.lockForWrite(userId);
      if (cart.vendorId === null || cart.lines.length === 0) {
        throw new AppError(ErrorCode.CART_EMPTY);
      }
      const quotes = await this.catalog.quote(
        cart.lines.map((line) => ({ ...line.choice, quantity: line.quantity })),
      );
      if (quotes.some((quote) => !allows(quote.fulfilment, request.method))) {
        throw new AppError(ErrorCode.FULFILMENT_NOT_SUPPORTED);
      }
      const fulfilment: CartFulfilment =
        request.method === 'delivery'
          ? await this.delivery(userId, request.addressId, request.date)
          : { method: 'pickup', addressId: null, date: request.date };
      await this.scheduling.assertDayAvailable({
        vendorId: cart.vendorId,
        method: request.method,
        orderTypes: orderTypesOf(cart),
        date: request.date,
      });
      cart.setFulfilment(fulfilment);
      await this.carts.save(cart);
    });
    return this.pricer.price(await this.carts.findByUser(userId), userId);
  }

  private async delivery(
    userId: string,
    addressId: string | null,
    date: string,
  ): Promise<CartFulfilment> {
    if (addressId === null) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: 'addressId', constraints: ['isDefined'] }],
      });
    }
    const coverage = await this.addresses.coverageOf(userId, addressId);
    if (!coverage.isCovered) {
      throw new AppError(ErrorCode.ADDRESS_NOT_COVERED);
    }
    return { method: 'delivery', addressId, date };
  }
}

/** Whether a product fulfilled `fulfilment` allows `method`; one the public cannot see allows none. */
function allows(
  fulfilment: LineFulfilment | null,
  method: FulfilmentMethod,
): boolean {
  return fulfilment === 'both' || fulfilment === method;
}
