import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A size on the public product page: weight, price, tag and whether it can be ordered. */
export class PublicProductSizeResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The size id (UUID): send it as the chosen size.',
  })
  id!: string;

  @ApiProperty({
    example: 8000,
    description:
      'The approximate weight in grams (`8000` is 8 kg); the final weight may differ.',
  })
  approxWeightGrams!: number;

  @ApiProperty({
    example: 95000,
    description:
      'The price of this size in halalas, VAT included (`95000` is 950.00 SAR).',
  })
  priceHalalas!: number;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description:
      'An optional label in Arabic and English, such as “Enough for an aqiqah”; null for none.',
  })
  tag!: LocalizedTextResponseDto | null;

  @ApiProperty({
    example: true,
    description:
      'Whether this size can be ordered now; `false`: out of stock, shown disabled.',
  })
  isAvailable!: boolean;
}
