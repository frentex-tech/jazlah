import type { Money } from '@common/money/money';
import type { FulfilmentMethod } from './fulfilment-method.type';
import type { OrderPaymentMethod } from './order-payment-method.type';
import type { OrderStatus } from './order-status.type';
import type { OrderType } from './order-type.type';
import type { OrderVendorSnapshot } from './order-vendor-snapshot.type';

/** An order as a list row: no lines, no history; the store as it was when the order was placed. */
export type OrderSummary = Readonly<{
  id: string;
  number: string;
  userId: string;
  customer: Readonly<{ name: string; phone: string }>;
  vendorId: string;
  vendor: OrderVendorSnapshot;
  status: OrderStatus;
  orderType: OrderType;
  fulfilment: FulfilmentMethod;
  fulfilmentDate: string;
  paymentMethod: OrderPaymentMethod;
  total: Money;
  createdAt: Date;
}>;
