import { ApiProperty } from '@nestjs/swagger';
import { ProductCardResponseDto } from './product-card-response.dto';

/** One page of products, newest first. */
export class ProductCardPageResponseDto {
  @ApiProperty({
    type: [ProductCardResponseDto],
    description:
      'The products of this page, newest first; empty when none match.',
  })
  items!: ProductCardResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
