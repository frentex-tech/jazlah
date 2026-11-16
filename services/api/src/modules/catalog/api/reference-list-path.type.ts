import type { REFERENCE_LIST_PATHS } from './reference-list-paths.constants';

/** An admin list's name in a path: `categories`, `meat-types`, `cutting-styles`, `exclusion-items`. */
export type ReferenceListPath = keyof typeof REFERENCE_LIST_PATHS;
