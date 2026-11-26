export const CART_ADDRESSES = Symbol('CART_ADDRESSES');

/** The customer's saved addresses as the cart needs them. */
export interface CartAddresses {
  /** Whether we deliver to the customer's address now; NOT_FOUND when it is not one of theirs. */
  coverageOf(
    userId: string,
    addressId: string,
  ): Promise<Readonly<{ isCovered: boolean }>>;
}
