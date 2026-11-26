import { ApiProperty } from '@nestjs/swagger';

/** The coupon applied to the cart. */
export class CartCouponResponseDto {
  @ApiProperty({
    example: 'EID15',
    description: 'The code, upper case.',
  })
  code!: string;

  @ApiProperty({
    type: 'integer',
    example: 15000,
    description: 'What it takes off now, in halalas.',
  })
  discountHalalas!: number;
}
