import type { GeoJsonPolygon } from './geo-json-polygon.type';
import { InvalidGeoJsonError } from './invalid-geo-json.error';
import { isGeoJsonPolygon } from './is-geo-json-polygon';

/**
 * A polygon column read as GeoJSON: select it with `ST_AsGeoJSON("column")` and pass
 * the text here. Checked (isGeoJsonPolygon) rather than asserted; anything else throws
 * InvalidGeoJsonError.
 */
export function toGeoJSON(text: string): GeoJsonPolygon {
  const value: unknown = JSON.parse(text);
  if (!isGeoJsonPolygon(value)) {
    throw new InvalidGeoJsonError();
  }
  return value;
}
