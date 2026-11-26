import { Module } from '@nestjs/common';
import { CartModule } from '@modules/cart';
import { SchedulingModule } from '@modules/scheduling';
import { SettingsModule } from '@modules/settings';
import { CustomerCheckoutController } from './api/controllers/customer.controller';
import { ListCheckoutDaysUseCase } from './application/list-checkout-days.use-case';
import { ListPaymentMethodsUseCase } from './application/list-payment-methods.use-case';
import { CHECKOUT_CART_SOURCE } from './domain/ports/checkout-cart-source.port';
import { CHECKOUT_SCHEDULING } from './domain/ports/checkout-scheduling.port';
import { CHECKOUT_SETTINGS } from './domain/ports/checkout-settings.port';
import { GetCartCheckoutCartSource } from './infrastructure/get-cart-checkout-cart-source';
import { OperationsSettingsCheckoutSettings } from './infrastructure/operations-settings-checkout-settings';
import { SchedulingServiceCheckoutScheduling } from './infrastructure/scheduling-service-checkout-scheduling';

/**
 * Checkout: what joins the cart, scheduling, orders and payments. Live: the days the
 * cart can be fulfilled on (SCH-API-2) and the cart's payment methods (cash on
 * delivery, PAY-API-1's methods route). Placing an order (ORD-API-1) and paying
 * (PAY-API-1) still answer NOT_IMPLEMENTED.
 */
@Module({
  imports: [CartModule, SchedulingModule, SettingsModule],
  controllers: [CustomerCheckoutController],
  providers: [
    ListCheckoutDaysUseCase,
    ListPaymentMethodsUseCase,
    { provide: CHECKOUT_CART_SOURCE, useClass: GetCartCheckoutCartSource },
    {
      provide: CHECKOUT_SCHEDULING,
      useClass: SchedulingServiceCheckoutScheduling,
    },
    {
      provide: CHECKOUT_SETTINGS,
      useClass: OperationsSettingsCheckoutSettings,
    },
  ],
})
export class CheckoutModule {}
