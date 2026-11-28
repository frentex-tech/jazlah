/** The sensitive admin actions of the orders module, written inside the transition transaction. */
export const ORDER_AUDIT = {
  statusTransitioned: {
    action: 'orders.status.transitioned',
    entity: 'order',
  },
} as const;
