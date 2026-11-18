import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';

/** A seeded coverage zone. */
export type SeedCoverageZone = Readonly<{
  /** Its id is derived from this (seedId). */
  key: string;
  nameAr: string;
  nameEn: string;
  city: string;
  polygon: GeoJsonPolygon;
  isActive: boolean;
  /** `#RRGGBB`. */
  color: string;
}>;
