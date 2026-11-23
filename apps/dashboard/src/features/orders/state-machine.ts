// ORD-API-2's transition table (allowed from → to, and who may do it), for the mock only: it answers each caller's
// `allowedTransitions` from it, as the API does. The pages read `allowedTransitions` from the order, never this table.
import type { Actor, OrderStatus } from './types.ts';

type Rule = { to: OrderStatus; by: Actor[]; only?: 'delivery' | 'pickup' };
const TABLE: Record<OrderStatus, Rule[]> = {
  pending_payment: [{ to: 'new', by: ['system'] }, { to: 'confirmed', by: ['system'] }, { to: 'cancelled', by: ['system', 'customer', 'admin'] }],
  new: [{ to: 'confirmed', by: ['system', 'admin'] }, { to: 'cancelled', by: ['customer', 'admin'] }],
  confirmed: [{ to: 'preparing', by: ['vendor', 'kitchen', 'admin'] }, { to: 'cancelled', by: ['admin'] }],
  preparing: [{ to: 'ready', by: ['vendor', 'kitchen', 'admin'] }, { to: 'cancelled', by: ['admin'] }],
  ready: [
    { to: 'picked_up', by: ['delivery', 'admin'], only: 'delivery' },
    { to: 'collected', by: ['vendor', 'admin'], only: 'pickup' },
    { to: 'cancelled', by: ['admin'] },
  ],
  picked_up: [{ to: 'out_for_delivery', by: ['delivery', 'admin'] }],
  out_for_delivery: [{ to: 'delivered', by: ['delivery', 'admin'] }, { to: 'delivery_failed', by: ['delivery', 'admin'] }],
  delivery_failed: [{ to: 'out_for_delivery', by: ['admin'] }, { to: 'returned', by: ['admin'] }],
  delivered: [],
  collected: [],
  cancelled: [],
  returned: [],
};

/** Where `actor` may move this order next. */
export const nextStatuses = (o: { status: OrderStatus; fulfilment: 'delivery' | 'pickup' }, actor: Actor): OrderStatus[] =>
  TABLE[o.status].filter((r) => r.by.includes(actor) && (!r.only || r.only === o.fulfilment)).map((r) => r.to);

export const canTransition = (o: { status: OrderStatus; fulfilment: 'delivery' | 'pickup' }, to: OrderStatus, actor: Actor) => nextStatuses(o, actor).includes(to);

/** A delivery date can still move until the order leaves the store. */
export const canReschedule = (s: OrderStatus) => (['new', 'confirmed', 'preparing', 'ready'] as OrderStatus[]).includes(s);

/** An order the COD review is waiting on (ORD-API-2: COD with `ops.cod.confirmation=review` stays `new`). */
export const awaitsCodReview = (o: { status: OrderStatus; paymentMethod: string }) => o.status === 'new' && o.paymentMethod === 'cod';
