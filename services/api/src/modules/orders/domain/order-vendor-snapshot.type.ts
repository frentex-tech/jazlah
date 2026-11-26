import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OrderGeoPoint } from './order-geo-point.type';

/** The store as it was when the order was placed. */
export type OrderVendorSnapshot = Readonly<{
  name: LocalizedText;
  phone: string | null;
  location: OrderGeoPoint | null;
  city: string | null;
}>;
