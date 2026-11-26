import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OrderGeoPoint } from './order-geo-point.type';
import type { TimeWindow } from './time-window.type';

/** Where a pickup order is collected, as it was when the order was placed. */
export type OrderPickupSnapshot = Readonly<{
  name: LocalizedText;
  address: LocalizedText | null;
  location: OrderGeoPoint | null;
  phone: string | null;
  hours: TimeWindow | null;
}>;
