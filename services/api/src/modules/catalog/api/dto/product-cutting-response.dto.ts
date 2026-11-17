import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A cutting style a product offers, with its extra price. */
export class ProductCuttingResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The id (UUID) of the cutting style.',
  })
  cuttingStyleId!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description:
      'The cutting style’s name in Arabic and English; null only inside a change request (look the name up on the live product or the list).',
  })
  name!: LocalizedTextResponseDto | null;

  @ApiProperty({
    example: 1500,
    description:
      'The extra price for this cutting style, in halalas, VAT included (`1500` is 15.00 SAR); 0 for no extra charge.',
  })
  extraPriceHalalas!: number;
}
