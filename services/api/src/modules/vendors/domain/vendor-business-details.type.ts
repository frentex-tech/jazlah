import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoPoint } from './geo-point.type';
import type { OptionalLocalizedText } from './optional-localized-text.type';

/** What an applicant tells about the business, apart from the IBAN and the documents. */
export type VendorBusinessDetails = Readonly<{
  name: LocalizedText;
  description: OptionalLocalizedText;
  /** 10 digits. */
  commercialRegistrationNumber: string;
  accountHolderName: string;
  location: GeoPoint;
}>;
