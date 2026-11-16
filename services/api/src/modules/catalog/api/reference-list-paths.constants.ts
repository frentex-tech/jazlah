import type { ReferenceList } from '../domain/reference-list.type';

/** The admin lists as they appear in paths (`admin/lists/:list`), and the list of each. */
export const REFERENCE_LIST_PATHS = {
  categories: 'categories',
  'meat-types': 'meat_types',
  'cutting-styles': 'cutting_styles',
  'exclusion-items': 'exclusion_items',
} as const satisfies Readonly<Record<string, ReferenceList>>;
