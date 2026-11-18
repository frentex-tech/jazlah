import type { Polygon } from './geo';

// The shape LOC-API-1 (#24) will serve at /v1/admin/coverage-zones, plus `color`, which the editor needs and the API
// task does not list yet. Replace with the generated schema types once the endpoints are in openapi.json.
export type CoverageZone = {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  color: string;
  isActive: boolean;
  polygon: Polygon;
};
export type ZoneInput = Omit<CoverageZone, 'id'>;
export type CoverageCheck = { covered: boolean; zone?: { id: string; name: string; city: string } };

import tokens from '../../../../../docs/design/tokens.json';

const TOKEN_NAMES = ['ember', 'info', 'success', 'warning', 'gold-text', 'brand'] as const;
/** Zone colors: brand tokens (read from tokens.json) that stay readable as a 20% fill on the map. */
export const ZONE_COLOR_NAMES: Record<string, (typeof TOKEN_NAMES)[number]> = Object.fromEntries(
  TOKEN_NAMES.map((n) => [tokens.color[n].value, n]),
);
export const ZONE_COLORS = TOKEN_NAMES.map((n) => tokens.color[n].value) as [string, ...string[]];
export const CITIES = ['riyadh', 'jeddah', 'dammam', 'makkah', 'madinah'] as const;
