/**
 * Where a change request is (the `product_change_request_status` enum). `superseded`:
 * the vendor edited the product again while it was pending, which opened a newer
 * request; it is kept for history and can no longer be decided.
 */
export const PRODUCT_CHANGE_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'superseded',
] as const;
