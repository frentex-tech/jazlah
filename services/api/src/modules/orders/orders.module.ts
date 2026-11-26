import { Module } from '@nestjs/common';
import { CLOCK } from '@common/time/clock.port';
import { SystemClock } from '@common/time/system-clock';
import { AdminOrdersController } from './api/controllers/admin.controller';
import { CustomerOrdersController } from './api/controllers/customer.controller';
import { VendorOrdersController } from './api/controllers/vendor.controller';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { FindCustomerOrderUseCase } from './application/find-customer-order.use-case';
import { ORDER_REPOSITORY } from './domain/ports/order.repository.port';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';

/**
 * Orders. Live (ORD-API-1): making an order (`CreateOrderUseCase`, called by checkout)
 * and reading the order of a customer (`FindCustomerOrderUseCase`). The state machine,
 * confirmation rules, the unpaid timeout, routing and history (ORD-API-2, ORD-API-3)
 * are not built: their controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [
    CustomerOrdersController,
    VendorOrdersController,
    AdminOrdersController,
  ],
  providers: [
    CreateOrderUseCase,
    FindCustomerOrderUseCase,
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [CreateOrderUseCase, FindCustomerOrderUseCase],
})
export class OrdersModule {}
