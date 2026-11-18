// Geometry helpers for the coverage editor (GeoJSON order: [lng, lat]).

export type Position = [number, number];
export type Polygon = { type: 'Polygon'; coordinates: Position[][] };

/** Ray casting on the outer ring; holes are not used by coverage zones. Points on an edge count as inside. */
export function pointInPolygon([x, y]: Position, polygon: Polygon): boolean {
  const ring = polygon.coordinates[0] ?? [];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if ((xi - x) * (yj - y) === (xj - x) * (yi - y) && Math.min(xi, xj) <= x && x <= Math.max(xi, xj) && Math.min(yi, yj) <= y && y <= Math.max(yi, yj)) return true;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** A closed ring with at least 3 distinct corners, the shape the API accepts before its own ST_IsValid check. */
export function isValidPolygon(polygon: Polygon): boolean {
  const ring = polygon.coordinates[0] ?? [];
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed = !!first && !!last && first[0] === last[0] && first[1] === last[1];
  return closed && new Set(ring.slice(0, -1).map((p) => p.join(','))).size >= 3 && !selfIntersects(ring);
}

const cross = (o: Position, a: Position, b: Position) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** True when two non-adjacent edges of the closed ring cross (a "bow tie"). */
export function selfIntersects(ring: Position[]): boolean {
  const n = ring.length - 1; // edges
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // adjacent edges share a corner
      const [a, b, c, d] = [ring[i]!, ring[i + 1]!, ring[j]!, ring[j + 1]!];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
    }
  }
  return false;
}
