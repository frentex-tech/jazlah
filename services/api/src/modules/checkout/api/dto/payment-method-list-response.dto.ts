import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodOptionResponseDto } from './payment-method-option-response.dto';

/** The payment methods for the cart (or an unpaid order), and the wallet balance that can pay part of it. */
export class PaymentMethodListResponseDto {
  @ApiProperty({
    type: [PaymentMethodOptionResponseDto],
    description:
      'The methods, in display order. Cash on delivery is left out when it is off, over its limit or not allowed for the order type.',
  })
  items!: PaymentMethodOptionResponseDto[];

  @ApiProperty({
    type: 'integer',
    example: 5000,
    description:
      'The customer’s wallet balance, in halalas; any part of it can pay with another method.',
  })
  walletBalanceHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 196_500,
    description: 'The total these methods are for, in halalas.',
  })
  totalHalalas!: number;
}
