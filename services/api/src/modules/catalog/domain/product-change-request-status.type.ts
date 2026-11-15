import type { PRODUCT_CHANGE_REQUEST_STATUSES } from './product-change-request-statuses.constants';

/** Where a change request is: pending until an admin approves or rejects it. */
export type ProductChangeRequestStatus =
  (typeof PRODUCT_CHANGE_REQUEST_STATUSES)[number];
