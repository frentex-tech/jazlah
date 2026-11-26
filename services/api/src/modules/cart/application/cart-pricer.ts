import { Inject, Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import { Cart } from '../domain/cart.entity';
import { priceCart } from '../domain/price-cart';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_CATALOG,
  type CartCatalog,
} from '../domain/ports/cart-catalog.port';
import {
  CART_SETTINGS,
  type CartSettingsSource,
} from '../domain/ports/cart-settings.port';

/**
 * Prices a cart as every cart answer shows it: today's quote of each line from the
 * catalog and the minimum order from the settings (`priceCart`). The delivery fee is 0
 * until a fulfilment is chosen (SCH-API-2).
 */
@Injectable()
export class CartPricer {
  constructor(
    @Inject(CART_CATALOG) private readonly catalog: CartCatalog,
    @Inject(CART_SETTINGS) private readonly settings: CartSettingsSource,
  ) {}

  async price(cart: Cart | null, userId: string): Promise<PricedCart> {
    const current = cart ?? Cart.empty(userId);
    const [quotes, settings] = await Promise.all([
      this.catalog.quote(
        current.lines.map((line) => ({
          ...line.choice,
          quantity: line.quantity,
        })),
      ),
      this.settings.current(),
    ]);
    return priceCart(current, quotes, {
      minOrder: settings.minOrder,
      deliveryFee: Money.zero(),
    });
  }
}
