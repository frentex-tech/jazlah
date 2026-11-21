// The order model of sprint-3.md (ORD-API-1 Order/OrderItem, ORD-API-2 statuses and history, PAY-API-1 payment and
// refund, WAL-API-1 wallet refunds). Not in openapi.json yet: the mock follows these shapes (docs/frontend/not-built-yet.md).
// Money is integer halalas (VAT included), times ISO instants shown in Asia/Riyadh, dates `YYYY-MM-DD` Riyadh days.

export const STATUSES = [
  'pending_payment', 'new', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'collected', 'cancelled', 'delivery_failed', 'returned',
] as const;
export type OrderStatus = (typeof STATUSES)[number];
export const METHODS = ['mada', 'card', 'applepay', 'cod', 'wallet'] as const;
export type PaymentMethod = (typeof METHODS)[number];
export type OrderType = 'ready_meat' | 'carcass' | 'cooked' | 'occasion' | 'adha' | 'mixed';
export type Actor = 'system' | 'customer' | 'admin' | 'vendor' | 'kitchen' | 'delivery';
export type Name = { ar: string; en: string };
export type Page<T> = { items: T[]; nextCursor: string | null };

/** A line with the product, size and option snapshots taken when the order was placed. */
export type OrderItem = {
  id: string;
  productId: string;
  name: Name;
  imageUrl: string | null;
  size: { name: Name; weightGrams: number | null } | null;
  cut: Name | null;
  packaging: Name | null;
  exclusions: Name[];
  quantity: number;
  unitPriceHalalas: number;
  totalHalalas: number;
};

export type GeoPoint = { latitude: number; longitude: number };
export type AddressSnapshot = { line: string; district: string | null; city: string; location: GeoPoint; notes: string | null };
export type PickupSnapshot = { name: Name; address: string; location: GeoPoint | null };
export type Refund = { id: string; amountHalalas: number; to: 'wallet' | 'original'; status: 'pending' | 'succeeded' | 'failed'; reason: string; at: string };
export type HistoryEntry = { from: OrderStatus | null; to: OrderStatus; actorType: Actor; note: string | null; at: string };

/** A row of the orders list. */
export type OrderSummary = {
  id: string;
  number: string;
  status: OrderStatus;
  orderType: OrderType;
  fulfilment: 'delivery' | 'pickup';
  vendor: { id: string; name: Name };
  customer: { name: string };
  paymentMethod: PaymentMethod;
  totalHalalas: number;
  deliveryDate: string;
  createdAt: string;
};

export type Order = Omit<OrderSummary, 'customer'> & {
  vendor: { id: string; name: Name; city: string | null };
  customer: { id: string; name: string; phone: string };
  items: OrderItem[];
  addressSnapshot: AddressSnapshot | null;
  pickupSnapshot: PickupSnapshot | null;
  window: { start: string; end: string } | null;
  subtotalHalalas: number;
  discountHalalas: number;
  deliveryFeeHalalas: number;
  vatAmountHalalas: number;
  notes: string | null;
  cancelReason: string | null;
  /** The wallet part of a split tender, and the gateway/COD part with its status (PAY-API-1). */
  payment: { method: PaymentMethod; status: 'initiated' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'; walletHalalas: number; cardLast4: string | null };
  refunds: Refund[];
  history: HistoryEntry[];
};

export type OrderQuery = { status?: OrderStatus; method?: PaymentMethod; vendorId?: string; date?: string; q?: string; cursor?: string; limit?: number };
/** A day offered for a reschedule, as SCH-API-2's `availableDays`. */
export type DayOption = { date: string; available: boolean; reason?: 'PAST_CUTOFF' | 'CLOSED' | 'FULL' | 'OUTSIDE_HORIZON' | 'VENDOR_CLOSED'; window: { start: string; end: string } };
export type CancelBody = { reason: string; refundTo: 'wallet' | 'original' };
