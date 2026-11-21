import type { GeoJsonPolygon } from './geo-json-polygon.type';
import type { GeoJsonPosition } from './geo-json-position.type';
import type { GeoPoint } from './geo-point.type';

/**
 * Whether `point` lies inside `polygon`: inside its outer ring and inside none of its
 * holes (even-odd ray casting, in plain degrees, as PostGIS treats SRID 4326 geometry).
 * In memory, for checks against polygons already loaded (the cached coverage zones); a
 * point exactly on an edge may answer either way, unlike ST_Covers, which counts it in.
 */
export function isPointInPolygon(
  point: GeoPoint,
  polygon: GeoJsonPolygon,
): boolean {
  const [outer, ...holes] = polygon.coordinates;
  return (
    outer !== undefined &&
    isInRing(point, outer) &&
    !holes.some((hole) => isInRing(point, hole))
  );
}

function isInRing(
  { latitude: y, longitude: x }: GeoPoint,
  ring: readonly GeoJsonPosition[],
): boolean {
  let inside = false;
  let previous = ring[ring.length - 1];
  for (const current of ring) {
    if (previous === undefined) {
      return false;
    }
    const [x1, y1] = current;
    const [x2, y2] = previous;
    if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
    previous = current;
  }
  return inside;
}
