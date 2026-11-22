import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PAYMENT_METHOD_NAMES } from '@modules/payments';

/** Pays an unpaid order again, possibly with another method. */
export class CreatePaymentDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    enumName: 'PaymentMethod',
    example: 'mada',
    description:
      'The method, from GET /v1/customer/checkout/payment-methods?orderId=.',
  })
  @IsIn(PAYMENT_METHOD_NAMES)
  paymentMethod!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    example: 5000,
    description:
      'Part of the total to take from the wallet with another method, in halalas, 0 to less than the total; left out: 0. With `wallet` leave it out: the whole total is taken. More than the balance: WALLET_INSUFFICIENT.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  walletAmountHalalas?: number;
}
