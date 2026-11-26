import { Inject, Injectable } from '@nestjs/common';
import type { PricedCart } from '../domain/priced-cart.type';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '../domain/ports/cart.repository.port';
import { CartPricer } from './cart-pricer';

/** The customer's cart priced today (GET /v1/customer/cart); empty when they have none. Reads only. */
@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    private readonly pricer: CartPricer,
  ) {}

  async execute(userId: string): Promise<PricedCart> {
    return this.pricer.price(await this.carts.findByUser(userId), userId);
  }
}
