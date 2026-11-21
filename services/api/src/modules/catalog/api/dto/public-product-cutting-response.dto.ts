import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A cutting style on the public product page, with its name and extra price. */
export class PublicProductCuttingResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of the cutting style: send it as the chosen cutting.',
  })
  cuttingStyleId!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The cutting style’s name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    example: 1500,
    description:
      'The extra price for this cutting style, in halalas, VAT included (`1500` is 15.00 SAR); 0 for no extra charge.',
  })
  extraPriceHalalas!: number;
}
