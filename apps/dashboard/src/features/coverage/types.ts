import type { Schemas } from '@/api/client';
import tokens from '../../../../../docs/design/tokens.json';

// The API's own shapes (services/api/openapi.json → src/api/schema.d.ts); docs/frontend/coverage.md.
export type CoverageZone = Schemas['CoverageZoneResponseDto'];
export type CreateZone = Schemas['CreateCoverageZoneDto'];
export type UpdateZone = Schemas['UpdateCoverageZoneDto'];
export type CoverageCheck = Schemas['CoverageCheckResponseDto'];

const TOKEN_NAMES = ['ember', 'info', 'success', 'warning', 'gold-text', 'brand'] as const;
/** Preset swatches: brand tokens that stay readable as a 20% fill on the map. The API takes any `#RRGGBB`. */
export const ZONE_COLOR_NAMES: Record<string, (typeof TOKEN_NAMES)[number]> = Object.fromEntries(
  TOKEN_NAMES.map((n) => [tokens.color[n].value.toUpperCase(), n]),
);
export const ZONE_COLORS = TOKEN_NAMES.map((n) => tokens.color[n].value.toUpperCase());
export const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
