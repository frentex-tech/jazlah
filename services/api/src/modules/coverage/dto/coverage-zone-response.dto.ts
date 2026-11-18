import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { COVERAGE_ZONE_COLOR } from '../coverage-zone-color.constants';
import { GeoJsonPolygonDto } from './geo-json-polygon.dto';

/** A coverage zone as admins see it. */
export class CoverageZoneResponseDto {
  @ApiProperty({
    format: 'uuid',
    description:
      'The zone id (UUID), for the `{id}` of /v1/admin/coverage-zones/{id}.',
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

  @ApiProperty({
    type: GeoJsonPolygonDto,
    description:
      'The boundary, a GeoJSON polygon (coordinates rounded to 9 decimal places).',
  })
  polygon!: GeoJsonPolygonDto;

  @ApiProperty({
    description: 'Whether the zone counts in the coverage check.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    pattern: COVERAGE_ZONE_COLOR.pattern.source,
    description: 'The zone colour on the dashboard map, `#RRGGBB`.',
    example: COVERAGE_ZONE_COLOR.default,
  })
  color!: string;

  @ApiProperty({
    format: 'date-time',
    description: 'When the zone was created, UTC (ISO 8601).',
    example: '2026-11-18T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    format: 'date-time',
    description: 'When the zone last changed, UTC (ISO 8601).',
    example: '2026-11-18T10:00:00.000Z',
  })
  updatedAt!: Date;
}
