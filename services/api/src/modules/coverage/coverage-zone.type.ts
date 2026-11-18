import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';

/** A delivery area as admins manage it (FR-LOC-02). */
export type CoverageZone = Readonly<{
  id: string;
  name: LocalizedText;
  city: string;
  polygon: GeoJsonPolygon;
  /** Only active zones count in the coverage check. */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;
