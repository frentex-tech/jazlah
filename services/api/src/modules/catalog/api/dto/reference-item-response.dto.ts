import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** An entry of an admin list (or a public category). */
export class ReferenceItemResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  createdAt!: Date;
}
