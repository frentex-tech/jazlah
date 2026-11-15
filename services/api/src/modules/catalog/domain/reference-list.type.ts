import type { REFERENCE_LISTS } from './reference-lists.constants';

/** One of the lists admins manage. */
export type ReferenceList = (typeof REFERENCE_LISTS)[number];
