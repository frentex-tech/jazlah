import type { CustomerAddressText } from './customer-address-text.type';
import type { GeoPoint } from './geo-point.type';

/**
 * A saved address (FR-ACC-03). Whether it lies inside a delivery zone is not known yet:
 * the check comes with the zones; the order will copy the address at checkout.
 */
export type CustomerAddress = CustomerAddressText &
  Readonly<{
    id: string;
    label: string;
    location: GeoPoint;
    /** Exactly one of a customer's addresses is the default once any exist. */
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
