import { ValidateBy, type ValidationOptions } from 'class-validator';
import { decodePageCursor } from '../pagination/decode-page-cursor';

/** Validates a `cursor` query value: a cursor this API wrote (decodePageCursor). */
export function IsPageCursor(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isPageCursor',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && decodePageCursor(value) !== null,
        defaultMessage: () => 'cursor must be a value returned as nextCursor',
      },
    },
    options,
  );
}
