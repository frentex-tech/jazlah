import type { GeoJsonPolygon } from './geo-json-polygon.type';
import type { GeoJsonPosition } from './geo-json-position.type';

/**
 * Whether `value` has the shape of a GeoJSON polygon PostGIS can read: `type`
 * `Polygon`, at least one ring, every ring closed with at least four positions, every
 * position exactly `[longitude, latitude]` as finite numbers in range. Whether the
 * polygon is also valid (no self-intersection) is PostGIS's question (ST_IsValid).
 */
export function isGeoJsonPolygon(value: unknown): value is GeoJsonPolygon {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'Polygon' &&
    'coordinates' in value &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length > 0 &&
    value.coordinates.every(isClosedRing)
  );
}

function isClosedRing(ring: unknown): boolean {
  if (!Array.isArray(ring) || ring.length < 4 || !ring.every(isPosition)) {
    return false;
  }
  const positions: readonly GeoJsonPosition[] = ring;
  const first = positions[0];
  const last = positions[positions.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

function isPosition(value: unknown): value is GeoJsonPosition {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }
  const position: unknown[] = value;
  const [longitude, latitude] = position;
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) <= 90
  );
}
