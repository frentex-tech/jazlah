import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { trimText } from '@common/dto/trim-text';
import { PAYMENT_METHOD_NAMES } from '@modules/payments';

/** Places the cart as an order: how to pay; the lines, coupon, address and day come from the cart. */
export class PlaceOrderDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    enumName: 'PaymentMethod',
    example: 'mada',
    description: 'The method, from GET /v1/customer/checkout/payment-methods.',
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

  @ApiPropertyOptional({
    example: 'اتصل قبل الوصول',
    description: 'A note on the order for the store, up to 500 characters.',
  })
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Length(1, 500)
  notes?: string;
}
