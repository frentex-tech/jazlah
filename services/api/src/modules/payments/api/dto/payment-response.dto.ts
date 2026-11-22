import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD_NAMES } from '../../domain/payment-method-names.constants';
import { PAYMENT_STATUS_NAMES } from '../../domain/payment-status-names.constants';
import { PaymentNextActionResponseDto } from './payment-next-action-response.dto';

/** One payment attempt of an order. */
export class PaymentResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The payment (UUID).',
  })
  id!: string;

  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    enumName: 'PaymentMethod',
    example: 'mada',
    description: 'How it is paid.',
  })
  method!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiProperty({
    enum: PAYMENT_STATUS_NAMES,
    enumName: 'PaymentStatus',
    example: 'initiated',
    description: 'Where it is.',
  })
  status!: (typeof PAYMENT_STATUS_NAMES)[number];

  @ApiProperty({
    type: 'integer',
    example: 191_500,
    description:
      'How much this attempt charges, in halalas (the order total less the wallet part).',
  })
  amountHalalas!: number;

  @ApiProperty({
    type: PaymentNextActionResponseDto,
    nullable: true,
    description:
      'What the app does next; null when nothing is paid online (cash on delivery, wallet only) or the payment is no longer `initiated`.',
  })
  nextAction!: PaymentNextActionResponseDto | null;

  @ApiProperty({
    example: '2026-11-22T10:00:00.000Z',
    description: 'When it was started (UTC).',
  })
  createdAt!: Date;
}
