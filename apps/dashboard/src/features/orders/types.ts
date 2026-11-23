// The order of the Sprint 3 contract (docs/frontend/orders.md), as the generated client types it: one shape for every
// app. Money is integer halalas (VAT included), times ISO instants shown in Asia/Riyadh, dates `yyyy-MM-dd` Riyadh days.
// Type-only imports: the unit tests run under plain node.
import type { Schemas } from '../../api/client.ts';

export const STATUSES = [
  'pending_payment', 'new', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'collected', 'cancelled', 'delivery_failed', 'returned',
] as const satisfies readonly Schemas['OrderStatus'][];
export type OrderStatus = Schemas['OrderStatus'];
export const METHODS = ['mada', 'card', 'applepay', 'cod', 'wallet'] as const satisfies readonly Schemas['PaymentMethod'][];
export type PaymentMethod = Schemas['PaymentMethod'];
export type Actor = Schemas['OrderHistoryEntryResponseDto']['actorType'];
export type Name = Schemas['LocalizedTextResponseDto'];
export type Page<T> = { items: T[]; nextCursor: string | null };

export type OrderItem = Schemas['OrderItemResponseDto'];
export type OrderSummary = Schemas['OrderSummaryResponseDto'];
export type Order = Schemas['OrderResponseDto'];

/** The list query, with the contract's names. */
export type OrderQuery = { status?: OrderStatus; paymentMethod?: PaymentMethod; vendorId?: string; fulfilmentDate?: string; q?: string; cursor?: string; limit?: number };

/**
 * Sprint 4 shapes, not in the contract yet (docs/frontend/not-built-yet.md): the mock alone offers them, the page shows
 * them disabled on the API. A day offered for a reschedule, as the customer's checkout days (`CheckoutDayResponseDto`).
 */
export type DayOption = Pick<Schemas['CheckoutDayResponseDto'], 'date' | 'isAvailable' | 'reason' | 'window'>;
export type CancelBody = { reason: string; refundTo: 'wallet' | 'original' };
