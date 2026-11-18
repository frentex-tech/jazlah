import { InvalidGeoJsonError } from './invalid-geo-json.error';
import { pointFromLatLng } from './point-from-lat-lng';
import { polygonFromGeoJSON } from './polygon-from-geo-json';
import { RIYADH_POLYGON } from './riyadh-polygon.fake';
import { toGeoJSON } from './to-geo-json';

describe('the PostGIS geo helpers', () => {
  it('toGeoJSON reads what ST_AsGeoJSON writes, and refuses anything else', () => {
    expect(toGeoJSON(JSON.stringify(RIYADH_POLYGON))).toEqual(RIYADH_POLYGON);
    expect(() =>
      toGeoJSON('{"type":"Point","coordinates":[46.6,24.6]}'),
    ).toThrow(InvalidGeoJsonError);
  });

  it('pointFromLatLng binds longitude first, as PostGIS wants', () => {
    const point = pointFromLatLng(24.7114, 46.6744);

    expect(point.sql).toContain('ST_MakePoint');
    expect(point.values).toEqual([46.6744, 24.7114]);
  });

  it('polygonFromGeoJSON binds the polygon as one GeoJSON text', () => {
    const polygon = polygonFromGeoJSON(RIYADH_POLYGON);

    expect(polygon.sql).toContain('ST_GeomFromGeoJSON');
    expect(polygon.values).toEqual([JSON.stringify(RIYADH_POLYGON)]);
  });
});
