import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** The chosen size as it was when ordered. */
export class OrderItemSizeResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The size’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: 'integer',
    example: 8000,
    description: 'Approximate weight in grams; the final weight may differ.',
  })
  approxWeightGrams!: number;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description: 'The size’s label, null for none.',
  })
  tag!: LocalizedTextResponseDto | null;
}
