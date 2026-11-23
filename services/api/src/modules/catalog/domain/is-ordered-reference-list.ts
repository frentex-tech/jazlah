import { ORDERED_REFERENCE_LISTS } from './ordered-reference-lists.constants';
import type { OrderedReferenceList } from './ordered-reference-list.type';
import type { ReferenceList } from './reference-list.type';

/** Whether the list's entries have a display order (ORDERED_REFERENCE_LISTS). */
export function isOrderedReferenceList(
  list: ReferenceList,
): list is OrderedReferenceList {
  return (ORDERED_REFERENCE_LISTS as readonly ReferenceList[]).includes(list);
}
