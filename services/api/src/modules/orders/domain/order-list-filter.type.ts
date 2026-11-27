import type { OrderPaymentMethod } from './order-payment-method.type';
import type { OrderScope } from './order-scope.type';
import type { OrderStatus } from './order-status.type';

/**
 * What an order list is limited to. `userId` (a customer's own orders) and `vendorId`
 * (a store's) are set by the use case from the signed-in caller, never from the query;
 * the rest are the caller's filters. `search` is the typed text: an order number, or part
 * of the customer's name or mobile.
 */
export type OrderListFilter = Readonly<{
  userId?: string | undefined;
  vendorId?: string | undefined;
  scope?: OrderScope | undefined;
  status?: OrderStatus | undefined;
  paymentMethod?: OrderPaymentMethod | undefined;
  fulfilmentDate?: string | undefined;
  search?: string | undefined;
}>;
