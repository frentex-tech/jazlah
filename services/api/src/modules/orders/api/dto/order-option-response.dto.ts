import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** A chosen option as it was when ordered: its id and name. */
export class OrderOptionResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The option’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'Its name in Arabic and English, as when ordered.',
  })
  name!: LocalizedTextResponseDto;
}
