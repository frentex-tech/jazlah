import { Inject, Injectable } from '@nestjs/common';
import { assertMethodSupported } from '../domain/assert-method-supported';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import type { CheckoutDay } from '../domain/checkout-day.type';
import {
  CHECKOUT_CART_SOURCE,
  type CheckoutCartSource,
} from '../domain/ports/checkout-cart-source.port';
import {
  CHECKOUT_SCHEDULING,
  type CheckoutScheduling,
} from '../domain/ports/checkout-scheduling.port';
import {
  CHECKOUT_SETTINGS,
  type CheckoutSettings,
} from '../domain/ports/checkout-settings.port';

/**
 * The days the customer's cart can be fulfilled on by `method` (GET
 * /v1/customer/checkout/days). Refused: ORDERING_PAUSED; CART_EMPTY;
 * FULFILMENT_NOT_SUPPORTED. Reads only.
 */
@Injectable()
export class ListCheckoutDaysUseCase {
  constructor(
    @Inject(CHECKOUT_CART_SOURCE) private readonly carts: CheckoutCartSource,
    @Inject(CHECKOUT_SCHEDULING)
    private readonly scheduling: CheckoutScheduling,
    @Inject(CHECKOUT_SETTINGS) private readonly settings: CheckoutSettings,
  ) {}

  async execute(
    userId: string,
    method: 'delivery' | 'pickup',
  ): Promise<CheckoutDay[]> {
    assertOrderingOpen(await this.settings.pause());
    const cart = await this.carts.cartOf(userId);
    const vendorId = assertMethodSupported(cart, method);
    return this.scheduling.availableDays({
      vendorId,
      method,
      orderTypes: cart.orderTypes,
    });
  }
}
