import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A cutting style a product offers, with its extra price. */
export class ProductCuttingResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  cuttingStyleId!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description:
      'Null only in a change request (names are shown for the live product).',
  })
  name!: LocalizedTextResponseDto | null;

  @ApiProperty({
    description: 'Halalas, VAT included; 0 for none.',
    example: 1500,
  })
  extraPriceHalalas!: number;
}
