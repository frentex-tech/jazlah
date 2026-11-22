import { Module } from '@nestjs/common';
import { CustomerCartController } from './controllers/customer.controller';

/**
 * The server cart (CRT-API-1): one store, lines priced by the catalog, coupon, fulfilment, totals and the guest merge. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [CustomerCartController],
})
export class CartModule {}
