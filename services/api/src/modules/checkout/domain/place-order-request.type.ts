/** What a customer sends to place an order (the body of POST /v1/customer/orders); the lines, address and day come from the cart. */
export type PlaceOrderRequest = Readonly<{
  paymentMethod: string;
  walletAmountHalalas?: number;
  notes?: string;
}>;
