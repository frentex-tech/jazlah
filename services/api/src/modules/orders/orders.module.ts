import { Module } from '@nestjs/common';
import { AdminOrdersController } from './api/controllers/admin.controller';
import { CustomerOrdersController } from './api/controllers/customer.controller';
import { VendorOrdersController } from './api/controllers/vendor.controller';

/**
 * Orders (ORD-API-2, ORD-API-3): the state machine, confirmation rules, the unpaid timeout, routing and history. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [
    CustomerOrdersController,
    VendorOrdersController,
    AdminOrdersController,
  ],
})
export class OrdersModule {}
