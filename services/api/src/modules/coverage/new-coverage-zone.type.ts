import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';

/** A zone to create. */
export type NewCoverageZone = Readonly<{
  name: LocalizedText;
  city: string;
  polygon: GeoJsonPolygon;
  isActive: boolean;
  /** `#RRGGBB`. */
  color: string;
}>;
