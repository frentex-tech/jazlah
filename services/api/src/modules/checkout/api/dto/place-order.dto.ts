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
import { PAYMENT_METHOD_NAMES } from '@modules/orders';

/** Places the cart as an order: how to pay; the lines, coupon, address and day come from the cart. */
export class PlaceOrderDto {
  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
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
      'How much of the total to take from the wallet, in halalas, 0 up to the total (the whole total only with `wallet`); left out: 0. More than the balance: WALLET_INSUFFICIENT.',
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
