import type { GeoJsonPolygon } from './geo-json-polygon.type';

/**
 * A sample of central Riyadh for the geo helpers' tests: a rectangle from Olaya to Al
 * Malaz (46.60 to 46.80 E, 24.60 to 24.80 N) with a hole around Al Murabba (46.70 to
 * 46.72 E, 24.64 to 24.66 N).
 */
export const RIYADH_POLYGON: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [46.6, 24.6],
      [46.8, 24.6],
      [46.8, 24.8],
      [46.6, 24.8],
      [46.6, 24.6],
    ],
    [
      [46.7, 24.64],
      [46.72, 24.64],
      [46.72, 24.66],
      [46.7, 24.66],
      [46.7, 24.64],
    ],
  ],
};
