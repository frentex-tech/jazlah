import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { toCompactText } from '@common/dto/to-compact-text';
import { VENDOR_FIELD_LIMITS } from '../../domain/vendor-field-limits.constants';
import { VENDOR_STATUSES } from '../../domain/vendor-statuses.constants';
import type { VendorStatus } from '../../domain/vendor-status.type';
import { BusinessSearchQueryDto } from './business-search-query.dto';

/**
 * The query of the admin's list of vendors: a page, optionally of one status, one city
 * and matching a search.
 */
export class ListVendorsQueryDto extends BusinessSearchQueryDto {
  @ApiPropertyOptional({
    enum: VENDOR_STATUSES,
    description:
      'Only vendors in this status: active or suspended. Omit it for every vendor, the platform vendor included.',
    example: 'active',
  })
  @IsOptional()
  @IsIn(VENDOR_STATUSES)
  status?: VendorStatus;

  @ApiPropertyOptional({
    minLength: VENDOR_FIELD_LIMITS.city.min,
    maxLength: VENDOR_FIELD_LIMITS.city.max,
    description: `Only vendors in exactly this city, as stored (trimmed; ${VENDOR_FIELD_LIMITS.city.min} to ${VENDOR_FIELD_LIMITS.city.max} characters). Vendors without a city are left out.`,
    example: 'الرياض',
  })
  @Transform(toCompactText)
  @IsOptional()
  @IsString()
  @CharLength(VENDOR_FIELD_LIMITS.city.min, VENDOR_FIELD_LIMITS.city.max)
  city?: string;
}
