import type { OrderActorType } from './order-actor-type.type';
import type { FulfilmentMethod } from './fulfilment-method.type';
import type { OrderStatus } from './order-status.type';
import type { OrderTransitionRule } from './order-transition-rule.type';

/**
 * The Sprint 3 transitions. Keep actor and fulfilment constraints here so the same
 * table controls both a requested transition and `allowedTransitions` in the response.
 * `pending_payment → confirmed` is the state-machine seam for a later payment capture;
 * its webhook is not part of ORD-API-2.
 */
export const ORDER_TRANSITION_RULES: readonly OrderTransitionRule[] = [
  { from: 'pending_payment', to: 'confirmed', actors: ['system'] },
  { from: 'new', to: 'confirmed', actors: ['system', 'admin', 'vendor'] },
  {
    from: 'new',
    to: 'cancelled',
    actors: ['admin', 'vendor'],
    releaseCapacity: true,
  },
  { from: 'confirmed', to: 'preparing', actors: ['admin', 'vendor'] },
  { from: 'preparing', to: 'ready', actors: ['admin', 'vendor'] },
  {
    from: 'ready',
    to: 'picked_up',
    actors: ['admin', 'vendor'],
    fulfilment: 'delivery',
  },
  {
    from: 'picked_up',
    to: 'out_for_delivery',
    actors: ['admin', 'vendor'],
    fulfilment: 'delivery',
  },
  {
    from: 'out_for_delivery',
    to: 'delivered',
    actors: ['admin', 'vendor'],
    fulfilment: 'delivery',
  },
  {
    from: 'ready',
    to: 'collected',
    actors: ['admin', 'vendor'],
    fulfilment: 'pickup',
  },
  {
    from: 'out_for_delivery',
    to: 'delivery_failed',
    actors: ['admin', 'vendor'],
    fulfilment: 'delivery',
  },
  {
    from: 'delivery_failed',
    to: 'out_for_delivery',
    actors: ['admin'],
    fulfilment: 'delivery',
  },
  {
    from: 'delivery_failed',
    to: 'returned',
    actors: ['admin'],
    fulfilment: 'delivery',
  },
];

/** The rule that authorizes this exact move, or null when it is forbidden. */
export function orderTransitionRuleFor(
  from: OrderStatus,
  to: OrderStatus,
  fulfilment: FulfilmentMethod,
  actor: OrderActorType,
): OrderTransitionRule | null {
  return (
    ORDER_TRANSITION_RULES.find(
      (rule) =>
        rule.from === from &&
        rule.to === to &&
        rule.actors.includes(actor) &&
        (rule.fulfilment === undefined || rule.fulfilment === fulfilment),
    ) ?? null
  );
}

/** The moves the same table permits this actor to make from the saved order. */
export function allowedOrderTransitions(
  status: OrderStatus,
  fulfilment: FulfilmentMethod,
  actor: OrderActorType,
): OrderStatus[] {
  return ORDER_TRANSITION_RULES.filter(
    (rule) =>
      rule.from === status &&
      rule.actors.includes(actor) &&
      (rule.fulfilment === undefined || rule.fulfilment === fulfilment),
  ).map((rule) => rule.to);
}
