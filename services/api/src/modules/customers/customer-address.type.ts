import type { CustomerAddressText } from './customer-address-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';

/**
 * A saved address (FR-ACC-03), and whether an active coverage zone covers it now
 * (CoverageService, read each time: zones change). The order will copy the address at
 * checkout.
 */
export type CustomerAddress = CustomerAddressText &
  Readonly<{
    id: string;
    label: string;
    location: GeoPoint;
    /** Exactly one of a customer's addresses is the default once any exist. */
    isDefault: boolean;
    /** Whether we deliver to its point today: an active coverage zone covers it. */
    isCovered: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
