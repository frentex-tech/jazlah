import type { CustomerAddressText } from './customer-address-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';

/**
 * Changes to an address; a field left out stays as it is, and null clears a readable
 * field. The default changes only through makeDefault.
 */
export type CustomerAddressChanges = Partial<CustomerAddressText> &
  Readonly<{
    label?: string;
    location?: GeoPoint;
  }>;
