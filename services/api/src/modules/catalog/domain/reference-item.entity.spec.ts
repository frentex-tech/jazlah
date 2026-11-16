import { ErrorCode } from '@common/errors/error-code.enum';
import { ReferenceItemRules } from './reference-item.entity';

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('ReferenceItemRules.assertOrderable', () => {
  it('accepts a display order for a category, and no order for any list', () => {
    expect(
      errorOf(() => ReferenceItemRules.assertOrderable('categories', 0)),
    ).toBeNull();
    expect(
      errorOf(() =>
        ReferenceItemRules.assertOrderable('meat_types', undefined),
      ),
    ).toBeNull();
  });

  it('refuses a display order for a list without one', () => {
    expect(
      errorOf(() => ReferenceItemRules.assertOrderable('cutting_styles', 1)),
    ).toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
    });
  });
});
