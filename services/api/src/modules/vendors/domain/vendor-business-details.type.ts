import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoPoint } from './geo-point.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';

/** What an applicant tells about the business, apart from the IBAN and the documents. */
export type VendorBusinessDetails = Readonly<{
  name: LocalizedText;
  description: OptionalLocalizedText;
  /** 10 digits. */
  commercialRegistrationNumber: string;
  /** Null when the applicant gave none (optional). 15 digits, starting and ending with 3. */
  vatNumber: string | null;
  /**
   * The city name as typed, 2 to 50 characters. Required on new applications; null only
   * for applications submitted before it was asked.
   */
  city: string | null;
  accountHolderName: string;
  location: GeoPoint;
}>;
