import { registerDecorator, type ValidationOptions } from 'class-validator';

/**
 * For a DTO string property whose length a database check constraint also limits: the
 * length is counted in Unicode code points, as PostgreSQL's `char_length` counts it,
 * and must be between `min` and `max` inclusive; otherwise (a non-string too) the
 * property fails with the constraint `charLength`. A value the DTO accepts is then
 * never refused by the check constraint (which would answer CONFLICT instead of
 * VALIDATION_FAILED).
 *
 * class-validator's MinLength and MaxLength count differently: they leave out the
 * variation selectors U+FE0E and U+FE0F, which `char_length` counts (`'❤️'` is 2). Use
 * them for a limit no constraint repeats, and this for one that a constraint does.
 */
export function CharLength(
  min: number,
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'charLength',
      target: target.constructor,
      propertyName: String(propertyName),
      constraints: [min, max],
      options,
      validator: {
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return false;
          }
          const length = [...value].length;
          return length >= min && length <= max;
        },
        defaultMessage: () =>
          `must be ${min} to ${max} characters long, counted in code points`,
      },
    });
  };
}
