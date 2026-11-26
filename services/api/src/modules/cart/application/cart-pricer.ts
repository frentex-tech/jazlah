import { Inject, Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import { Cart } from '../domain/cart.entity';
import type { CartSettings } from '../domain/cart-settings.type';
import { priceCart } from '../domain/price-cart';
import type { PricedCart } from '../domain/priced-cart.type';
import type { PricedFulfilment } from '../domain/priced-fulfilment.type';
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

/**
 * Prices a cart as every cart answer shows it: today's quote of each line from the
 * catalog, the minimum order from the settings (`priceCart`), and the fulfilment once
 * chosen: delivery adds the delivery fee and shows the delivery window; pickup shows
 * where to collect (the scheduling engine's pickup point).
 */
@Injectable()
export class CartPricer {
  constructor(
    @Inject(CART_CATALOG) private readonly catalog: CartCatalog,
    @Inject(CART_SETTINGS) private readonly settings: CartSettingsSource,
    @Inject(CART_SCHEDULING) private readonly scheduling: CartScheduling,
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
    const fulfilment = await this.fulfilmentOf(current, settings);
    return priceCart(current, quotes, {
      minOrder: settings.minOrder,
      deliveryFee:
        fulfilment?.method === 'delivery' ? settings.deliveryFee : Money.zero(),
      fulfilment,
    });
  }

  private async fulfilmentOf(
    cart: Cart,
    settings: CartSettings,
  ): Promise<PricedFulfilment | null> {
    const chosen = cart.fulfilment;
    if (chosen === null || cart.vendorId === null) {
      return null;
    }
    if (chosen.method === 'delivery') {
      return { ...chosen, window: settings.deliveryWindow, pickupPoint: null };
    }
    return {
      ...chosen,
      window: null,
      pickupPoint: await this.scheduling.pickupPoint(cart.vendorId),
    };
  }
}
