/** Injection token of the orders module's active-order lookup port. */
export const ACTIVE_ORDER_LOOKUP = Symbol('ACTIVE_ORDER_LOOKUP');

/** Whether a customer has any order that has not reached a final status. */
export interface ActiveOrderLookup {
  hasActiveOrders(userId: string): Promise<boolean>;
}
