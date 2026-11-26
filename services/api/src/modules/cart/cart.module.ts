import { Module } from '@nestjs/common';
import { CatalogModule } from '@modules/catalog';
import { CustomersModule } from '@modules/customers';
import { SchedulingModule } from '@modules/scheduling';
import { SettingsModule } from '@modules/settings';
import { CustomerCartController } from './api/controllers/customer.controller';
import { AddCartItemUseCase } from './application/add-cart-item.use-case';
import { CartPricer } from './application/cart-pricer';
import { ClearCartUseCase } from './application/clear-cart.use-case';
import { GetCartUseCase } from './application/get-cart.use-case';
import { RemoveCartItemUseCase } from './application/remove-cart-item.use-case';
import { SetCartFulfilmentUseCase } from './application/set-cart-fulfilment.use-case';
import { UpdateCartItemUseCase } from './application/update-cart-item.use-case';
import { CART_ADDRESSES } from './domain/ports/cart-addresses.port';
import { CART_CATALOG } from './domain/ports/cart-catalog.port';
import { CART_SCHEDULING } from './domain/ports/cart-scheduling.port';
import { CART_SETTINGS } from './domain/ports/cart-settings.port';
import { CART_REPOSITORY } from './domain/ports/cart.repository.port';
import { CustomerAddressesCartAddresses } from './infrastructure/customer-addresses-cart-addresses';
import { OperationsSettingsCartSettings } from './infrastructure/operations-settings-cart-settings';
import { PricingServiceCartCatalog } from './infrastructure/pricing-service-cart-catalog';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository';
import { SchedulingServiceCartScheduling } from './infrastructure/scheduling-service-cart-scheduling';

/**
 * The server cart (CRT-API-1): one store, lines priced by the catalog, the totals, and
 * the fulfilment (SCH-API-2). Four layers (DECISIONS.md, "Sprint 3 contract"). Exports
 * `GetCartUseCase` for checkout. The guest merge and the coupon (CRT-API-3) still
 * answer NOT_IMPLEMENTED.
 */
@Module({
  imports: [CatalogModule, SettingsModule, SchedulingModule, CustomersModule],
  controllers: [CustomerCartController],
  providers: [
    CartPricer,
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    ClearCartUseCase,
    SetCartFulfilmentUseCase,
    { provide: CART_REPOSITORY, useClass: PrismaCartRepository },
    { provide: CART_CATALOG, useClass: PricingServiceCartCatalog },
    { provide: CART_SETTINGS, useClass: OperationsSettingsCartSettings },
    { provide: CART_SCHEDULING, useClass: SchedulingServiceCartScheduling },
    { provide: CART_ADDRESSES, useClass: CustomerAddressesCartAddresses },
  ],
  exports: [GetCartUseCase],
})
export class CartModule {}
