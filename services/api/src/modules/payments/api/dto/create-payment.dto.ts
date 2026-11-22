import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PAYMENT_METHOD_NAMES } from '@modules/orders';

/** Pays an unpaid order again, possibly with another method. */
export class CreatePaymentDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    example: 'mada',
    description: 'The method.',
  })
  @IsIn(PAYMENT_METHOD_NAMES)
  method!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    example: 5000,
    description:
      'How much of the total to take from the wallet, in halalas, 0 up to the total (the whole total only with `wallet`); left out: 0. More than the balance: WALLET_INSUFFICIENT.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  walletAmountHalalas?: number;
}
