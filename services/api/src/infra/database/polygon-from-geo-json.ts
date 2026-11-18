import { Prisma } from './generated/prisma/client';
import type { GeoJsonPolygon } from './geo-json-polygon.type';

/**
 * A PostGIS polygon in WGS 84 (SRID 4326) for a raw query, from GeoJSON, as a bound
 * parameter: `INSERT … VALUES (${polygonFromGeoJSON(polygon)})`, or
 * `SELECT ST_IsValid(${polygonFromGeoJSON(polygon)})` to check it first.
 */
export function polygonFromGeoJSON(polygon: GeoJsonPolygon): Prisma.Sql {
  return Prisma.sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(polygon)}::text), 4326)`;
}
