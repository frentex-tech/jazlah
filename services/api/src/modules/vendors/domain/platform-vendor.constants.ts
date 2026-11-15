/**
 * The platform's own vendor, which sells JAZLA's products (`pnpm vendor:create-platform`):
 * its names and its commission (none: the platform keeps its whole sale).
 */
export const PLATFORM_VENDOR = {
  name: { ar: 'جزلة', en: 'JAZLA' },
  commissionBasisPoints: 0,
} as const;
