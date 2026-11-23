import type { ReferenceList } from './reference-list.type';

/**
 * The admin lists whose entries have a display order admins set: categories only. The
 * repository maps each to its table by type (OrderedReferenceList), so adding one here
 * fails to compile until its table has the column.
 */
export const ORDERED_REFERENCE_LISTS = [
  'categories',
] as const satisfies readonly ReferenceList[];

/** The largest display order an admin may set (lower first; 0 by default). */
export const MAX_SORT_ORDER = 100_000;
