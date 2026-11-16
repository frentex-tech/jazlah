import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A size of a product: approximate weight, price and optional tag. */
export class ProductSizeResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Null only for a new size in a change request.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string | null;

  @ApiProperty({ description: 'Grams.', example: 8000 })
  approxWeightGrams!: number;

  @ApiProperty({ description: 'Halalas, VAT included.', example: 95000 })
  priceHalalas!: number;

  @ApiProperty({ type: LocalizedTextResponseDto, nullable: true })
  tag!: LocalizedTextResponseDto | null;
}
