import type { CustomerAddressText } from './customer-address-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';

/**
 * A saved address (FR-ACC-03), its live coverage and order-lock state. Orders keep the
 * address snapshot and its nullable saved-address reference.
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
    /** Whether a non-final order refers to this saved address. */
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
