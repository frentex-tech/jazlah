import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { registerDecorator, type ValidationOptions } from 'class-validator';
import { normalizeSaudiMobileNumber } from './normalize-saudi-mobile-number';

const E164_SAUDI_MOBILE = /^\+9665\d{8}$/;

function IsSaudiMobileNumber(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isSaudiMobileNumber',
      target: target.constructor,
      propertyName: String(propertyName),
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && E164_SAUDI_MOBILE.test(value),
        defaultMessage: () => 'must be a Saudi mobile number',
      },
    });
  };
}

/**
 * For a DTO property holding a Saudi mobile number. The value is accepted in every form
 * `normalizeSaudiMobileNumber` accepts and the property then holds it in E.164
 * (`+9665XXXXXXXX`); anything else fails validation with the constraint
 * `isSaudiMobileNumber`. Code after the validation pipe never normalises again.
 */
export function SaudiMobileNumber(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string'
        ? (normalizeSaudiMobileNumber(value) ?? value)
        : value,
    ),
    IsSaudiMobileNumber(),
  );
}
