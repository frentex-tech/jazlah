import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { ORDERED_REFERENCE_LISTS } from './ordered-reference-lists.constants';
import type { ReferenceList } from './reference-list.type';

/** The rules on an entry of an admin list. */
export class ReferenceItemRules {
  /**
   * Only a list with a display order (ORDERED_REFERENCE_LISTS: categories) takes a
   * `sortOrder`; on another list it would be dropped silently, so it is refused:
   * VALIDATION_FAILED on `sortOrder` (constraint `isOrderedList`).
   */
  static assertOrderable(
    list: ReferenceList,
    sortOrder: number | undefined,
  ): void {
    if (sortOrder !== undefined && !ORDERED_REFERENCE_LISTS.includes(list)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
      });
    }
  }
}
