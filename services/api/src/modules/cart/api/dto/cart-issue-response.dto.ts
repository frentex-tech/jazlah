import { ApiProperty } from '@nestjs/swagger';
import { CART_ISSUE_CODES } from '../../domain/cart-issue-codes.constants';

/** Something on a line that blocks checkout. */
export class CartIssueResponseDto {
  @ApiProperty({
    enum: CART_ISSUE_CODES,
    example: 'PRICE_CHANGED',
    description: '`PRICE_CHANGED` or `ITEM_UNAVAILABLE`.',
  })
  code!: (typeof CART_ISSUE_CODES)[number];

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The line (UUID).',
  })
  lineId!: string;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 95000,
    description: 'PRICE_CHANGED: the accepted price; null otherwise.',
  })
  oldUnitPriceHalalas!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 97000,
    description: 'PRICE_CHANGED: today’s price; null otherwise.',
  })
  newUnitPriceHalalas!: number | null;
}
