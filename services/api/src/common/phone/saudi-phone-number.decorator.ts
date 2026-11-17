import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { registerDecorator, type ValidationOptions } from 'class-validator';
import { normalizeSaudiPhoneNumber } from './normalize-saudi-phone-number';

const E164_SAUDI_PHONE = /^\+966(?:5\d{8}|1[1-467]\d{7})$/;

function IsSaudiPhoneNumber(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isSaudiPhoneNumber',
      target: target.constructor,
      propertyName: String(propertyName),
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && E164_SAUDI_PHONE.test(value),
        defaultMessage: () => 'must be a Saudi mobile or landline number',
      },
    });
  };
}

/**
 * For a DTO property holding a Saudi contact number, mobile or landline. The value is
 * accepted in every form `normalizeSaudiPhoneNumber` accepts and the property then holds
 * it in E.164 (`+9665XXXXXXXX` or `+9661XXXXXXXX`); anything else fails validation with
 * the constraint `isSaudiPhoneNumber`. Never for sign-in: that is SaudiMobileNumber.
 */
export function SaudiPhoneNumber(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string'
        ? (normalizeSaudiPhoneNumber(value) ?? value)
        : value,
    ),
    IsSaudiPhoneNumber(),
  );
}
