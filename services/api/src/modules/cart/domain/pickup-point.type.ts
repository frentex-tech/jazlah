import type { LocalizedText } from '@common/i18n/localized-text.type';

/** Where the customer collects a pickup order. */
export type PickupPoint = Readonly<{
  name: LocalizedText;
  /** Null when there is no address text. */
  address: LocalizedText | null;
  /** Null when the store has no map point. */
  location: Readonly<{ latitude: number; longitude: number }> | null;
  phone: string | null;
  /** Null while stores have no hours. */
  hours: Readonly<{ start: string; end: string }> | null;
}>;
