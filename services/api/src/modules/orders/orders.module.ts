import { Module } from '@nestjs/common';
import { CLOCK } from '@common/time/clock.port';
import { SystemClock } from '@common/time/system-clock';
import { AuditModule } from '@infra/audit/audit.module';
import { SchedulingModule } from '@modules/scheduling';
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
import { TransitionOrderUseCase } from './application/transition-order.use-case';
import { ACTIVE_ORDER_LOOKUP } from './domain/ports/active-order-lookup.port';
import { ORDER_ADDRESS_USAGE } from './domain/ports/order-address-usage.port';
import { ORDER_REPOSITORY } from './domain/ports/order.repository.port';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';

/**
 * Orders: making an order (ORD-API-1), guarded state transitions and COD confirmation
 * (ORD-API-2), plus the lists and details of each audience (ORD-API-3). Payment expiry,
 * webhooks and realtime subscribers are later work.
 */
@Module({
  imports: [AuditModule, SchedulingModule],
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
    TransitionOrderUseCase,
    PrismaOrderRepository,
    { provide: ORDER_REPOSITORY, useExisting: PrismaOrderRepository },
    { provide: ORDER_ADDRESS_USAGE, useExisting: PrismaOrderRepository },
    { provide: ACTIVE_ORDER_LOOKUP, useExisting: PrismaOrderRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [
    CreateOrderUseCase,
    FindCustomerOrderUseCase,
    TransitionOrderUseCase,
    ORDER_ADDRESS_USAGE,
    ACTIVE_ORDER_LOOKUP,
  ],
})
export class OrdersModule {}
