import type { NewCoverageZone } from './new-coverage-zone.type';

/** Changes to a zone; a field left undefined stays as it is. */
export type CoverageZoneChanges = Partial<NewCoverageZone>;
