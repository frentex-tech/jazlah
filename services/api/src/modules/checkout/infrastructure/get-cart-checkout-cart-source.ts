import { Injectable } from '@nestjs/common';
import { GetCartUseCase } from '@modules/cart';
import type { CheckoutCart } from '../domain/checkout-cart.type';
import type { CheckoutCartSource } from '../domain/ports/checkout-cart-source.port';

/** `CheckoutCartSource` on the cart module's `GetCartUseCase` (priced now). */
@Injectable()
export class GetCartCheckoutCartSource implements CheckoutCartSource {
  constructor(private readonly getCart: GetCartUseCase) {}

  async cartOf(userId: string): Promise<CheckoutCart> {
    const cart = await this.getCart.execute(userId);
    return {
      vendorId: cart.lines.length === 0 ? null : cart.vendorId,
      lineFulfilments: cart.lines.map((line) => line.fulfilment),
      orderTypes: cart.orderTypes,
      total: cart.total,
    };
  }
}
