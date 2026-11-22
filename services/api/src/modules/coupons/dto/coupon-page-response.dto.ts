import { ApiProperty } from '@nestjs/swagger';
import { CouponResponseDto } from './coupon-response.dto';

/** One page of coupons, newest first. */
export class CouponPageResponseDto {
  @ApiProperty({
    type: [CouponResponseDto],
    description: 'The coupons on this page.',
  })
  items!: CouponResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'eyJjIjoiMjAyNi0xMS0yMFQwODowMDowMC4wMDBaIn0',
    description: 'Send as `cursor` for the next page; null on the last.',
  })
  nextCursor!: string | null;
}
