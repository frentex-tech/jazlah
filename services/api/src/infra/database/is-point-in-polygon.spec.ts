import { isPointInPolygon } from './is-point-in-polygon';
import { RIYADH_POLYGON } from './riyadh-polygon.fake';

describe('isPointInPolygon', () => {
  it.each([
    ['Kingdom Centre, Olaya', 24.7114, 46.6744, true],
    ['Al Malaz', 24.6667, 46.7333, true],
    ['inside the hole (Al Murabba)', 24.65, 46.71, false],
    ['Diriyah, west of the polygon', 24.7339, 46.5753, false],
    ['King Khalid Airport, north of it', 24.9576, 46.6988, false],
    ['Jeddah', 21.5433, 39.1728, false],
  ])('%s: %s', (_, latitude, longitude, inside) => {
    expect(isPointInPolygon({ latitude, longitude }, RIYADH_POLYGON)).toBe(
      inside,
    );
  });

  it('handles a concave ring: the notch of an L shape is outside', () => {
    const l = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [46.6, 24.6],
          [46.8, 24.6],
          [46.8, 24.7],
          [46.7, 24.7],
          [46.7, 24.8],
          [46.6, 24.8],
          [46.6, 24.6],
        ] as const,
      ],
    };

    expect(isPointInPolygon({ latitude: 24.75, longitude: 46.65 }, l)).toBe(
      true,
    );
    expect(isPointInPolygon({ latitude: 24.75, longitude: 46.75 }, l)).toBe(
      false,
    );
  });
});
