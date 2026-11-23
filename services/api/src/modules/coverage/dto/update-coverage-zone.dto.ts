import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
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

/** Changes to a coverage zone; a field left out stays as it is. */
export class UpdateCoverageZoneDto {
  @ApiPropertyOptional({
    type: LocalizedNameDto,
    description:
      'The new name in Arabic and English, both together; left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name?: LocalizedNameDto;

  @ApiPropertyOptional({
    minLength: COVERAGE_LIMITS.city.min,
    maxLength: COVERAGE_LIMITS.city.max,
    description: `The city, ${COVERAGE_LIMITS.city.min} to ${COVERAGE_LIMITS.city.max} characters; left out: unchanged.`,
    example: 'الرياض',
  })
  @IsOptional()
  @Transform(toCompactText)
  @IsString()
  @CharLength(COVERAGE_LIMITS.city.min, COVERAGE_LIMITS.city.max)
  city?: string;

  @ApiPropertyOptional({
    type: GeoJsonPolygonDto,
    description: 'The new boundary, a GeoJSON polygon; left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  polygon?: GeoJsonPolygonDto;

  @ApiPropertyOptional({
    description:
      '`false`: the zone stops counting in the coverage check at once (addresses in it show as not covered); `true`: it counts again. Left out: unchanged.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    pattern: COVERAGE_ZONE_COLOR.pattern.source,
    description: 'The new map colour, `#RRGGBB`; left out: unchanged.',
    example: COVERAGE_ZONE_COLOR.default,
  })
  @IsOptional()
  @IsString()
  @Matches(COVERAGE_ZONE_COLOR.pattern)
  color?: string;
}
