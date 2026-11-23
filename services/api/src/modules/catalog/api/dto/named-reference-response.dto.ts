import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A list entry a product refers to, with its name. */
export class NamedReferenceResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The entry’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The entry’s name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;
}
