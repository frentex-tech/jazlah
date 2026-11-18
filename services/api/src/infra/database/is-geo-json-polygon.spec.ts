import { isGeoJsonPolygon } from './is-geo-json-polygon';
import { RIYADH_POLYGON } from './riyadh-polygon.fake';

const ring = [
  [46.6, 24.6],
  [46.8, 24.6],
  [46.8, 24.8],
  [46.6, 24.6],
];

describe('isGeoJsonPolygon', () => {
  it('accepts a polygon with a hole, and a triangle', () => {
    expect(isGeoJsonPolygon(RIYADH_POLYGON)).toBe(true);
    expect(isGeoJsonPolygon({ type: 'Polygon', coordinates: [ring] })).toBe(
      true,
    );
  });

  it.each([
    ['null', null],
    ['a point', { type: 'Point', coordinates: [46.6, 24.6] }],
    ['no ring', { type: 'Polygon', coordinates: [] }],
    ['an open ring', { type: 'Polygon', coordinates: [ring.slice(0, 3)] }],
    [
      'three positions',
      { type: 'Polygon', coordinates: [[ring[0], ring[1], ring[0]]] },
    ],
    [
      'a ring not closed',
      { type: 'Polygon', coordinates: [[...ring.slice(0, 3), [46.7, 24.7]]] },
    ],
    [
      'an altitude',
      {
        type: 'Polygon',
        coordinates: [ring.map(([x, y]) => [x, y, 600])],
      },
    ],
    [
      'a latitude past 90',
      { type: 'Polygon', coordinates: [ring.map(([x]) => [x, 91])] },
    ],
    [
      'a string for a number',
      { type: 'Polygon', coordinates: [ring.map(([x, y]) => [String(x), y])] },
    ],
  ])('refuses %s', (_, value) => {
    expect(isGeoJsonPolygon(value)).toBe(false);
  });
});
