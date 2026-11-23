import type { ValidationError } from 'class-validator';
import type { FieldError } from '../errors/field-error.type';

/**
 * Flattens class-validator's nested errors into one entry per invalid field,
 * with a dotted path and the names of the failed constraints.
 */
export function toFieldErrors(
  errors: readonly ValidationError[],
  parentPath = '',
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own: FieldError[] = error.constraints
      ? [{ field, constraints: Object.keys(error.constraints) }]
      : [];
    return [...own, ...toFieldErrors(error.children ?? [], field)];
  });
}
