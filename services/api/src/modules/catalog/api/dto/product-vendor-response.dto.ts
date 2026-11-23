import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** The vendor selling a product. */
export class ProductVendorResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The vendor’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description:
      'The vendor’s store name in Arabic and English; null only if the vendor cannot be read.',
  })
  name!: LocalizedTextResponseDto | null;
}
