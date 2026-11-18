import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** The zone a point lies in. */
export class CoveringZoneResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The zone id (UUID).',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The zone name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ description: 'The city, as written.', example: 'الرياض' })
  city!: string;
}
