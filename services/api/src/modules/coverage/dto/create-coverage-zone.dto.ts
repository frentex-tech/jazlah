import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { toCompactText } from '@common/dto/to-compact-text';
import { COVERAGE_LIMITS } from '../coverage-limits.constants';
import { COVERAGE_ZONE_COLOR } from '../coverage-zone-color.constants';
import { GeoJsonPolygonDto } from './geo-json-polygon.dto';

/** A new coverage zone. */
export class CreateCoverageZoneDto {
  @ApiProperty({
    type: LocalizedNameDto,
    description:
      'The zone name in Arabic and English (a district or area name).',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

  @ApiProperty({
    minLength: COVERAGE_LIMITS.city.min,
    maxLength: COVERAGE_LIMITS.city.max,
    description: `The city the zone is in, as written (Arabic expected): ${COVERAGE_LIMITS.city.min} to ${COVERAGE_LIMITS.city.max} characters after invisible format characters are removed and spaces trimmed.`,
    example: 'الرياض',
  })
  @Transform(toCompactText)
  @IsString()
  @CharLength(COVERAGE_LIMITS.city.min, COVERAGE_LIMITS.city.max)
  city!: string;

  @ApiProperty({
    type: GeoJsonPolygonDto,
    description: 'The zone boundary, a GeoJSON polygon.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  polygon!: GeoJsonPolygonDto;

  @ApiPropertyOptional({
    default: true,
    description:
      'Whether the zone counts in the coverage check at once; true when left out.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    pattern: COVERAGE_ZONE_COLOR.pattern.source,
    default: COVERAGE_ZONE_COLOR.default,
    description: `The zone colour on the dashboard map, \`#RRGGBB\` (either case); \`${COVERAGE_ZONE_COLOR.default}\` when left out.`,
    example: COVERAGE_ZONE_COLOR.default,
  })
  @IsOptional()
  @IsString()
  @Matches(COVERAGE_ZONE_COLOR.pattern)
  color?: string;
}
