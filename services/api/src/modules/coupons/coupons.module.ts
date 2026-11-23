import { Module } from '@nestjs/common';
import { AdminCouponsController } from './controllers/admin.controller';

/**
 * Coupons (CRT-API-3): the engine the cart and checkout ask, and the admin endpoints. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [AdminCouponsController],
})
export class CouponsModule {}
