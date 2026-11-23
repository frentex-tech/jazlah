import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { isOrderedReferenceList } from './is-ordered-reference-list';
import type { ReferenceList } from './reference-list.type';

/** The rules on an entry of an admin list. */
export class ReferenceListEntry {
  /**
   * Only a list with a display order (ORDERED_REFERENCE_LISTS: categories) takes a
   * `sortOrder`; on another list it would be dropped silently, so it is refused:
   * VALIDATION_FAILED on `sortOrder` (constraint `isOrderedList`).
   */
  static assertOrderable(
    list: ReferenceList,
    sortOrder: number | undefined,
  ): void {
    if (sortOrder !== undefined && !isOrderedReferenceList(list)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
      });
    }
  }

  /**
   * Only categories have an image; on another list `imageMediaId` (even null) would be
   * dropped silently, so it is refused: VALIDATION_FAILED on `imageMediaId` (constraint
   * `isCategoryList`).
   */
  static assertImageable(
    list: ReferenceList,
    imageMediaId: string | null | undefined,
  ): void {
    if (imageMediaId !== undefined && list !== 'categories') {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: 'imageMediaId', constraints: ['isCategoryList'] }],
      });
    }
  }
}
