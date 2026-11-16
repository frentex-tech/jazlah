import type { ReferenceList } from '../domain/reference-list.type';
import type { ReferenceListPath } from './reference-list-path.type';
import { REFERENCE_LIST_PATHS } from './reference-list-paths.constants';

/** The admin list a validated `:list` path parameter names. */
export function toReferenceList(path: ReferenceListPath): ReferenceList {
  return REFERENCE_LIST_PATHS[path];
}
