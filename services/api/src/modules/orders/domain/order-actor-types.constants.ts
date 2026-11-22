/** Who moved an order: the platform itself, the customer, an admin, the vendor, a kitchen or the delivery company. */
export const ORDER_ACTOR_TYPES = [
  'system',
  'customer',
  'admin',
  'vendor',
  'kitchen',
  'delivery',
] as const;
