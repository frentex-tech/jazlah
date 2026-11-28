/** Injection token of the orders module's saved-address usage port. */
export const ORDER_ADDRESS_USAGE = Symbol('ORDER_ADDRESS_USAGE');

/** Whether a saved address is on a non-final order. */
export interface OrderAddressUsage {
  isLocked(userId: string, addressId: string): Promise<boolean>;
}
