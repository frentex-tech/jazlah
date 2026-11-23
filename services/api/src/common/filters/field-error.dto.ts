import { ApiProperty } from '@nestjs/swagger';
import type { FieldError } from '../errors/field-error.type';

/** The documented shape of FieldError: one invalid field of a VALIDATION_FAILED response. */
export class FieldErrorDto implements FieldError {
  @ApiProperty({
    description: 'Dotted path of the invalid field.',
    example: 'address.city',
  })
  readonly field!: string;

  @ApiProperty({
    description:
      'Names of the failed checks (class-validator constraint names), stable and language-neutral.',
    type: [String],
    example: ['isString', 'isNotEmpty'],
  })
  readonly constraints!: readonly string[];
}
