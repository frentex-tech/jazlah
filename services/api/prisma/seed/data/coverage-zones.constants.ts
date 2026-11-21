import type { SeedCoverageZone } from './seed-coverage-zone.type';

/**
 * The sample coverage zone: central and north Riyadh, a rectangle from 24.60 to 24.85 N
 * and 46.55 to 46.85 E. Every seeded customer address is inside except Al Narjis
 * (24.8652 N), so the apps can show both a covered and an uncovered address.
 */
export const SEED_COVERAGE_ZONES: readonly SeedCoverageZone[] = [
  {
    key: 'riyadh-central-north',
    nameAr: 'وسط وشمال الرياض',
    nameEn: 'Central and North Riyadh',
    city: 'الرياض',
    polygon: {
      type: 'Polygon',
      coordinates: [
        [
          [46.55, 24.6],
          [46.85, 24.6],
          [46.85, 24.85],
          [46.55, 24.85],
          [46.55, 24.6],
        ],
      ],
    },
    isActive: true,
    color: '#6A1A20',
  },
];
