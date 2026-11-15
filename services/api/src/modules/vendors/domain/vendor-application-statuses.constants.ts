import type { VendorApplicationStatus } from './vendor-application-status.type';

/** Every status an application can have. */
export const VENDOR_APPLICATION_STATUSES: readonly VendorApplicationStatus[] = [
  'pending',
  'approved',
  'rejected',
];
