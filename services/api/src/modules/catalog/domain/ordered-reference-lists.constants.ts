import type { ReferenceList } from './reference-list.type';

/** The admin lists whose entries have a display order admins set: categories only. */
export const ORDERED_REFERENCE_LISTS: readonly ReferenceList[] = ['categories'];

/** The largest display order an admin may set (lower first; 0 by default). */
export const MAX_SORT_ORDER = 100_000;
