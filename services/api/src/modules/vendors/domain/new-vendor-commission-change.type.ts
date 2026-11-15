import type { VendorCommissionChange } from './vendor-commission-change.type';

/** What is recorded in the commission history; the id and time come from the database. */
export type NewVendorCommissionChange = Omit<
  VendorCommissionChange,
  'id' | 'createdAt'
>;
