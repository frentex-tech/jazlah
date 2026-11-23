import { ApiProperty } from '@nestjs/swagger';
import { OrderSummaryResponseDto } from './order-summary-response.dto';

/** One page of orders, newest first. */
export class OrderPageResponseDto {
  @ApiProperty({
    type: [OrderSummaryResponseDto],
    description: 'The orders on this page.',
  })
  items!: OrderSummaryResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'eyJjIjoiMjAyNi0xMS0yMlQxMDowMDowMC4wMDBaIn0',
    description: 'Send as `cursor` for the next page; null on the last.',
  })
  nextCursor!: string | null;
}
