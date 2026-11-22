import { ApiProperty } from '@nestjs/swagger';

/** How a coupon has been used. */
export class CouponUsageResponseDto {
  @ApiProperty({
    type: 'integer',
    example: 37,
    description: 'Orders that used it (not cancelled).',
  })
  uses!: number;

  @ApiProperty({
    type: 'integer',
    example: 31,
    description: 'Different customers among them.',
  })
  distinctCustomers!: number;

  @ApiProperty({
    type: 'integer',
    example: 185_000,
    description: 'What it took off in all, in halalas.',
  })
  totalDiscountHalalas!: number;
}
