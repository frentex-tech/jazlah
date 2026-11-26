import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';

/** What other modules may read of a store, for a customer collecting an order there. */
export type VendorStore = Readonly<{
  id: string;
  name: LocalizedText;
  /** Null when the vendor has none. */
  city: string | null;
  /** Null when the vendor has no map point. */
  location: GeoPoint | null;
  /** The store contact phone (#244); null when not set. */
  contactPhone: string | null;
}>;
