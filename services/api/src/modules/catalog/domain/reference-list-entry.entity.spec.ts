import { ErrorCode } from '@common/errors/error-code.enum';
import { ReferenceListEntry } from './reference-list-entry.entity';

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('ReferenceListEntry.assertOrderable', () => {
  it('accepts a display order for a category, and no order for any list', () => {
    expect(
      errorOf(() => ReferenceListEntry.assertOrderable('categories', 0)),
    ).toBeNull();
    expect(
      errorOf(() =>
        ReferenceListEntry.assertOrderable('meat_types', undefined),
      ),
    ).toBeNull();
  });

  it('refuses a display order for a list without one', () => {
    expect(
      errorOf(() => ReferenceListEntry.assertOrderable('cutting_styles', 1)),
    ).toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
    });
  });
});
