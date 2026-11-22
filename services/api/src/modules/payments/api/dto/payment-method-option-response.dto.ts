import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD_NAMES } from '@modules/orders';
import { PAYMENT_METHOD_UNAVAILABLE_REASONS } from '../../domain/payment-method-unavailable-reasons.constants';

/** A payment method the customer may see. */
export class PaymentMethodOptionResponseDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    example: 'cod',
    description: 'The method.',
  })
  method!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiProperty({
    example: true,
    description:
      'Whether it can be chosen now; `false`: shown disabled with `reason`.',
  })
  isAvailable!: boolean;

  @ApiProperty({
    enum: PAYMENT_METHOD_UNAVAILABLE_REASONS,
    nullable: true,
    example: 'insufficient_balance',
    description: 'Why not, when not available; null otherwise.',
  })
  reason!: (typeof PAYMENT_METHOD_UNAVAILABLE_REASONS)[number] | null;
}
