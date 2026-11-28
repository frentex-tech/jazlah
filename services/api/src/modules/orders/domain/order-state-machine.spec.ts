import {
  allowedOrderTransitions,
  orderTransitionRuleFor,
} from './order-state-machine';

describe('order state machine', () => {
  it.each([
    ['pending_payment', 'confirmed', 'delivery', 'system'],
    ['new', 'confirmed', 'delivery', 'system'],
    ['new', 'confirmed', 'delivery', 'vendor'],
    ['new', 'confirmed', 'pickup', 'admin'],
    ['new', 'cancelled', 'delivery', 'vendor'],
    ['new', 'cancelled', 'delivery', 'admin'],
    ['confirmed', 'preparing', 'pickup', 'vendor'],
    ['preparing', 'ready', 'delivery', 'admin'],
    ['ready', 'picked_up', 'delivery', 'vendor'],
    ['picked_up', 'out_for_delivery', 'delivery', 'admin'],
    ['out_for_delivery', 'delivered', 'delivery', 'vendor'],
    ['ready', 'collected', 'pickup', 'admin'],
    ['out_for_delivery', 'delivery_failed', 'delivery', 'vendor'],
    ['out_for_delivery', 'delivery_failed', 'delivery', 'admin'],
    ['delivery_failed', 'out_for_delivery', 'delivery', 'admin'],
    ['delivery_failed', 'returned', 'delivery', 'admin'],
  ] as const)('allows %s → %s for %s on %s', (from, to, fulfilment, actor) => {
    expect(orderTransitionRuleFor(from, to, fulfilment, actor)).not.toBeNull();
  });

  it.each([
    ['new', 'preparing', 'delivery', 'admin'],
    ['ready', 'picked_up', 'pickup', 'admin'],
    ['ready', 'collected', 'delivery', 'vendor'],
    ['out_for_delivery', 'delivery_failed', 'pickup', 'admin'],
    ['delivery_failed', 'returned', 'delivery', 'vendor'],
    ['delivered', 'preparing', 'delivery', 'admin'],
    ['collected', 'cancelled', 'pickup', 'admin'],
  ] as const)('forbids %s → %s for %s on %s', (from, to, fulfilment, actor) => {
    expect(orderTransitionRuleFor(from, to, fulfilment, actor)).toBeNull();
  });

  it('returns allowedTransitions from the same rule table for each audience actor', () => {
    expect(allowedOrderTransitions('new', 'delivery', 'vendor')).toEqual([
      'confirmed',
      'cancelled',
    ]);
    expect(allowedOrderTransitions('new', 'delivery', 'admin')).toEqual([
      'confirmed',
      'cancelled',
    ]);
    expect(allowedOrderTransitions('new', 'delivery', 'customer')).toEqual([]);
    expect(
      allowedOrderTransitions('delivery_failed', 'delivery', 'vendor'),
    ).toEqual([]);
    expect(
      allowedOrderTransitions('delivery_failed', 'delivery', 'admin'),
    ).toEqual(['out_for_delivery', 'returned']);
  });

  it('returns a capacity-release rule only for COD rejection from new', () => {
    const rule = orderTransitionRuleFor('new', 'cancelled', 'pickup', 'admin');

    expect(rule?.releaseCapacity).toBe(true);
    expect(
      orderTransitionRuleFor('confirmed', 'preparing', 'pickup', 'admin')
        ?.releaseCapacity,
    ).toBeUndefined();
  });
});
