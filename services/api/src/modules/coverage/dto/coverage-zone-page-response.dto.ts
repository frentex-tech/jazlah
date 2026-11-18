import { ApiProperty } from '@nestjs/swagger';
import { CoverageZoneResponseDto } from './coverage-zone-response.dto';

/** One page of coverage zones, newest first. */
export class CoverageZonePageResponseDto {
  @ApiProperty({
    type: [CoverageZoneResponseDto],
    description: 'The zones of this page, newest first; empty when none exist.',
  })
  items!: CoverageZoneResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
