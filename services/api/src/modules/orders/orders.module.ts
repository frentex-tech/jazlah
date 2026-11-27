import { Module } from '@nestjs/common';
import { CLOCK } from '@common/time/clock.port';
import { SystemClock } from '@common/time/system-clock';
import { AdminOrdersController } from './api/controllers/admin.controller';
import { CustomerOrdersController } from './api/controllers/customer.controller';
import { VendorOrdersController } from './api/controllers/vendor.controller';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { FindAdminOrderUseCase } from './application/find-admin-order.use-case';
import { FindCustomerOrderUseCase } from './application/find-customer-order.use-case';
import { FindVendorOrderUseCase } from './application/find-vendor-order.use-case';
import { ListAdminOrdersUseCase } from './application/list-admin-orders.use-case';
import { ListCustomerOrdersUseCase } from './application/list-customer-orders.use-case';
import { ListVendorOrdersUseCase } from './application/list-vendor-orders.use-case';
import { ORDER_REPOSITORY } from './domain/ports/order.repository.port';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';

/**
 * Orders. Live: making an order (`CreateOrderUseCase`, called by checkout, ORD-API-1)
 * and reading orders, the lists and the detail of each audience (ORD-API-3). The state
 * machine, confirmation rules and the unpaid timeout (ORD-API-2) and the realtime
 * events are not built: the transition routes carry the contract and answer
 * NOT_IMPLEMENTED.
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
    FindVendorOrderUseCase,
    FindAdminOrderUseCase,
    ListCustomerOrdersUseCase,
    ListVendorOrdersUseCase,
    ListAdminOrdersUseCase,
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [CreateOrderUseCase, FindCustomerOrderUseCase],
})
export class OrdersModule {}
