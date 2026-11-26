import type { Money } from '@common/money/money';
import type { FulfilmentMethod } from './fulfilment-method.type';
import type { NewOrderLine } from './new-order-line.type';
import type { OrderAddressSnapshot } from './order-address-snapshot.type';
import type { OrderPaymentMethod } from './order-payment-method.type';
import type { OrderPickupSnapshot } from './order-pickup-snapshot.type';
import type { OrderType } from './order-type.type';
import type { OrderVendorSnapshot } from './order-vendor-snapshot.type';
import type { TimeWindow } from './time-window.type';

/**
 * What `CreateOrderUseCase` needs to place an order, whatever its source (a cart now,
 * an occasion or an animal later): everything already checked (prices, day, capacity).
 * The money of the order is worked out from the lines and the delivery fee (`priceOrder`).
 */
export type NewOrder = Readonly<{
  userId: string;
  customer: Readonly<{ name: string; phone: string }>;
  vendorId: string;
  vendor: OrderVendorSnapshot;
  /** The commission of the vendor now, in basis points. */
  commissionBasisPoints: number;
  orderType: OrderType;
  lines: readonly NewOrderLine[];
  fulfilment: FulfilmentMethod;
  /** The Riyadh day. */
  fulfilmentDate: string;
  /** The delivery window; null for pickup. */
  window: TimeWindow | null;
  address: OrderAddressSnapshot | null;
  pickupPoint: OrderPickupSnapshot | null;
  deliveryFee: Money;
  paymentMethod: OrderPaymentMethod;
  notes: string | null;
  /** Whole carcasses the order holds, as reserved against the day. */
  carcasses: number;
}>;
