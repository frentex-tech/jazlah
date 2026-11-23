import type { ORDERED_REFERENCE_LISTS } from './ordered-reference-lists.constants';

/** An admin list whose entries have a display order. */
export type OrderedReferenceList = (typeof ORDERED_REFERENCE_LISTS)[number];
