import type { CustomerAddressText } from './customer-address-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';

/** A new address, as the customer gives it. */
export type NewCustomerAddress = CustomerAddressText &
  Readonly<{
    label: string;
    location: GeoPoint;
    /** Makes it the default; the first address is the default anyway. */
    makeDefault: boolean;
  }>;
