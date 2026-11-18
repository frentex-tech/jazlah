/** A coverage zone's colour on the dashboard map (`coverage_zones_color_check`). */
export const COVERAGE_ZONE_COLOR = {
  /** `#RRGGBB`, either case. */
  pattern: /^#[0-9A-Fa-f]{6}$/,
  /** When a new zone names none: the brand's deep red. */
  default: '#6A1A20',
} as const;
