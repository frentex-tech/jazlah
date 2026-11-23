import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, ValidateIf } from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { toCompactText } from '@common/dto/to-compact-text';
import { VENDOR_FIELD_LIMITS } from '../../domain/vendor-field-limits.constants';
import { UpdateVendorProfileDto } from './update-vendor-profile.dto';

/**
 * An admin's changes to a vendor's profile: everything the vendor may change, and the
 * city, which only an admin sets (the vendor's location comes with its own task;
 * DECISIONS.md, "Vendors").
 */
export class UpdateVendorProfileAsAdminDto extends UpdateVendorProfileDto {
  @ApiPropertyOptional({
    minLength: VENDOR_FIELD_LIMITS.city.min,
    maxLength: VENDOR_FIELD_LIMITS.city.max,
    description: `The city the store is in, as written (Arabic expected): ${VENDOR_FIELD_LIMITS.city.min} to ${VENDOR_FIELD_LIMITS.city.max} characters after invisible format characters are removed and spaces trimmed. Shown on the public store page. Omit it to keep the current one; null is VALIDATION_FAILED (a city is changed, not removed).`,
    example: 'جدة',
  })
  @Transform(toCompactText)
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @CharLength(VENDOR_FIELD_LIMITS.city.min, VENDOR_FIELD_LIMITS.city.max)
  city?: string;
}
