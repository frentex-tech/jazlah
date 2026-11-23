import { ApiProperty } from '@nestjs/swagger';
import { CoveringZoneResponseDto } from './covering-zone-response.dto';

/** Whether we deliver to a point, and in which zone. */
export class CoverageCheckResponseDto {
  @ApiProperty({
    description: 'Whether an active coverage zone covers the point.',
    example: true,
  })
  covered!: boolean;

  @ApiProperty({
    type: CoveringZoneResponseDto,
    nullable: true,
    description: 'The zone covering the point; null when `covered` is false.',
  })
  zone!: CoveringZoneResponseDto | null;
}
