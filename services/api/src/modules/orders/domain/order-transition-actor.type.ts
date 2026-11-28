/** The callers that can ask the orders module to move an order in Sprint 3. */
export type OrderTransitionActor =
  | Readonly<{ type: 'system'; id: null }>
  | Readonly<{ type: 'admin'; id: string }>
  | Readonly<{ type: 'vendor'; id: string; vendorId: string }>;
