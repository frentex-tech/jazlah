import type { SeedIncompatibility } from './seed-incompatibility.type';

/**
 * The seeded cutting and packaging rules: a carcass served whole fits no tray, bag or
 * vacuum pack, and quarters and halves fit no tray.
 */
export const SEED_INCOMPATIBILITIES: readonly SeedIncompatibility[] = [
  { cuttingStyle: 'mafatah', packaging: 'trays' },
  { cuttingStyle: 'mafatah', packaging: 'bags' },
  { cuttingStyle: 'mafatah', packaging: 'vacuum' },
  { cuttingStyle: 'quarters', packaging: 'trays' },
  { cuttingStyle: 'halves', packaging: 'trays' },
];
