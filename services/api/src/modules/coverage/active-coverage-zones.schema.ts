import { z } from 'zod';
import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';
import { isGeoJsonPolygon } from '@infra/database/is-geo-json-polygon';

/** A cached active zones list as read back from Redis: checked, never asserted (R21). */
export const ACTIVE_COVERAGE_ZONES_SCHEMA = z.array(
  z.object({
    id: z.string(),
    name: z.object({ ar: z.string(), en: z.string() }),
    city: z.string(),
    polygon: z.custom<GeoJsonPolygon>(isGeoJsonPolygon),
  }),
);
