import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoPoint } from '@infra/database/geo-point.type';
import type { TimeWindow } from '@modules/settings';

/** Where and when a customer collects from a store (`pickupTermsOf`). */
export type PickupTerms = Readonly<{
  /** Whether the store offers pickup. */
  isOffered: boolean;
  /** The window of an open pickup day. */
  window: TimeWindow;
  point: Readonly<{
    name: LocalizedText;
    /** Null when there is no address text. */
    address: LocalizedText | null;
    location: GeoPoint | null;
    phone: string | null;
    /** The store's hours; null while vendors have none. */
    hours: TimeWindow | null;
  }>;
}>;
