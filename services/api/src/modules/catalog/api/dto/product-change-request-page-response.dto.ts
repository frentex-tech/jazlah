import { ApiProperty } from '@nestjs/swagger';
import { ProductChangeRequestResponseDto } from './product-change-request-response.dto';

/** One page of pending change requests, newest first. */
export class ProductChangeRequestPageResponseDto {
  @ApiProperty({
    type: [ProductChangeRequestResponseDto],
    description:
      'The pending change requests of this page, newest first; empty when none wait.',
  })
  items!: ProductChangeRequestResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
