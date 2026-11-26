import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import type { PaymentMethodOption } from '../domain/payment-method-option.type';
import { paymentMethodsFor } from '../domain/payment-methods-for';
import {
  CHECKOUT_CART_SOURCE,
  type CheckoutCartSource,
} from '../domain/ports/checkout-cart-source.port';
import {
  CHECKOUT_SETTINGS,
  type CheckoutSettings,
} from '../domain/ports/checkout-settings.port';

/**
 * The payment methods for the customer's cart (GET
 * /v1/customer/checkout/payment-methods without `orderId`): cash on delivery when
 * allowed (`paymentMethodsFor`), the cart's total, and a wallet balance of 0 (the
 * wallet comes after November 30). CART_EMPTY for an empty cart. Reads only.
 */
@Injectable()
export class ListPaymentMethodsUseCase {
  constructor(
    @Inject(CHECKOUT_CART_SOURCE) private readonly carts: CheckoutCartSource,
    @Inject(CHECKOUT_SETTINGS) private readonly settings: CheckoutSettings,
  ) {}

  async execute(userId: string): Promise<
    Readonly<{
      items: PaymentMethodOption[];
      walletBalance: Money;
      total: Money;
    }>
  > {
    const cart = await this.carts.cartOf(userId);
    if (cart.vendorId === null) {
      throw new AppError(ErrorCode.CART_EMPTY);
    }
    return {
      items: paymentMethodsFor(cart, await this.settings.cod()),
      walletBalance: Money.zero(),
      total: cart.total,
    };
  }
}
