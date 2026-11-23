import { ValidateBy, type ValidationOptions } from 'class-validator';
import { Iban } from '../../domain/iban';

/**
 * Validates an IBAN in electronic form (toIbanElectronicForm first) as a Saudi IBAN:
 * country SA, 24 characters, a correct checksum. Fails with the constraint
 * `isSaudiIban`, never echoing the value.
 */
export function IsSaudiIban(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isSaudiIban',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Iban.parse(value) !== null,
        defaultMessage: () => 'iban must be a valid Saudi IBAN',
      },
    },
    options,
  );
}
