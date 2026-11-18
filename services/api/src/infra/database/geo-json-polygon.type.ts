import type { GeoJsonPosition } from './geo-json-position.type';

/**
 * A GeoJSON polygon (RFC 7946) in WGS 84: the outer ring first, then any holes. Each
 * ring is closed (its last position repeats the first) and has at least four positions
 * (isGeoJsonPolygon).
 */
export type GeoJsonPolygon = Readonly<{
  type: 'Polygon';
  coordinates: readonly (readonly GeoJsonPosition[])[];
}>;
