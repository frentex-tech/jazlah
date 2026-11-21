import type { ActiveCoverageZone } from './active-coverage-zone.type';

/**
 * What the cache answered: the current version of the active zones list and the list
 * cached for it, null on a miss (load it, then write it under this version).
 */
export type CachedActiveZones = Readonly<{
  version: string;
  zones: readonly ActiveCoverageZone[] | null;
}>;
