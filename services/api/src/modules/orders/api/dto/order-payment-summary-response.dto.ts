import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD_NAMES } from '../../domain/payment-method-names.constants';
import { PAYMENT_STATUS_NAMES } from '../../domain/payment-status-names.constants';

/** How the order is paid: the method, the latest payment’s status and the wallet part. */
export class OrderPaymentSummaryResponseDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    example: 'mada',
    description: 'The method chosen for what the wallet does not cover.',
  })
  method!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiProperty({
    enum: PAYMENT_STATUS_NAMES,
    nullable: true,
    example: 'captured',
    description:
      'The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).',
  })
  status!: (typeof PAYMENT_STATUS_NAMES)[number] | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The latest payment (UUID); null as status is.',
  })
  paymentId!: string | null;

  @ApiProperty({
    type: 'integer',
    example: 5000,
    description: 'The part paid from the wallet, in halalas; 0 for none.',
  })
  walletHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 0,
    description:
      'Wallet money given back because the online part failed or the order was cancelled unpaid; 0 for none.',
  })
  walletRestoredHalalas!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '4242',
    description: 'The card’s last 4 digits once known; null otherwise.',
  })
  cardLast4!: string | null;
}
