import { Module } from '@nestjs/common';
import { CustomerCheckoutController } from './api/controllers/customer.controller';

/**
 * Placing an order (ORD-API-1): the cart checked again and the order created in one transaction. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [CustomerCheckoutController],
})
export class CheckoutModule {}
