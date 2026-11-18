import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';
import type { CoveringZone } from './covering-zone.type';

/** An active coverage zone with its polygon: what the cache keeps. */
export type ActiveCoverageZone = CoveringZone &
  Readonly<{ polygon: GeoJsonPolygon }>;
