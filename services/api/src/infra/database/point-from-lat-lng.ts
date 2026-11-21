import { Prisma } from './generated/prisma/client';

/**
 * A PostGIS point in WGS 84 (SRID 4326) for a raw query, from degrees:
 * `ST_Covers("polygon", ${pointFromLatLng(lat, lng)})`. Longitude goes first in
 * PostGIS; this takes latitude first, as people write it. Both are bound parameters.
 */
export function pointFromLatLng(
  latitude: number,
  longitude: number,
): Prisma.Sql {
  return Prisma.sql`ST_SetSRID(ST_MakePoint(${longitude}::double precision, ${latitude}::double precision), 4326)`;
}
