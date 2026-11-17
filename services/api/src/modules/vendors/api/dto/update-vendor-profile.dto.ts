import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedDescriptionDto } from '@common/dto/localized-description.dto';
import { toEmail } from '@common/dto/to-email';
import { SaudiPhoneNumber } from '@common/phone/saudi-phone-number.decorator';
import { VENDOR_FIELD_LIMITS } from '../../domain/vendor-field-limits.constants';
import { toDigits } from './to-digits';
import { VAT_NUMBER_PATTERN } from './vat-number-pattern.constants';

/**
 * Changes to a vendor's profile (FR-VND-02), by the vendor itself; admins send
 * UpdateVendorProfileAsAdminDto, which adds the city. A field left out stays as it is.
 * `logoMediaId`, `coverMediaId`, `contactPhone`, `contactEmail` and `vatNumber` set to
 * null clear them; `description` is an object, never null (a language set to null inside
 * it clears that language).
 */
export class UpdateVendorProfileDto {
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The id (UUID) of a file the signed-in user uploaded with purpose vendor.logo and confirmed (JPEG, PNG or WebP, up to 2 MB); null removes the logo; omit it to keep the current one.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  logoMediaId?: string | null;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The id (UUID) of a file the signed-in user uploaded with purpose vendor.cover and confirmed (JPEG, PNG or WebP, up to 2 MB): the wide photo at the top of the store page. null removes it; omit it to keep the current one.',
    example: '8a4b3d2f-1c0e-4f6a-9b7c-2d3e4f5a6b7c',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  coverMediaId?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The store’s contact number for the platform (not shown to customers): a Saudi mobile or landline (area code 011 to 017), in any usual form (05…, 011…, +966…, Arabic digits, spaces). Stored and returned in E.164 (+966…). null removes it; omit it to keep the current one. VALIDATION_FAILED with isSaudiPhoneNumber otherwise.',
    example: '0112345678',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @SaudiPhoneNumber()
  contactPhone?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: VENDOR_FIELD_LIMITS.contactEmailMax,
    description: `The store’s contact email for the platform (not shown to customers), up to ${VENDOR_FIELD_LIMITS.contactEmailMax} characters; stored lowercase and not verified. null or blank removes it; omit it to keep the current one.`,
    example: 'contact@example.com',
  })
  @Transform(toEmail)
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(VENDOR_FIELD_LIMITS.contactEmailMax)
  @IsEmail()
  contactEmail?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The VAT registration number: 15 digits starting and ending with 3, Latin or Arabic. null removes it; omit it to keep the current one.',
    example: '310123456700003',
  })
  @Transform(toDigits)
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsString()
  @Matches(VAT_NUMBER_PATTERN)
  vatNumber?: string | null;

  @ApiPropertyOptional({
    type: LocalizedDescriptionDto,
    description:
      'The store description: an object, never null. Inside it a language left out stays as it is, and null or a blank text clears it. Omit the whole field to keep both.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description?: LocalizedDescriptionDto;
}
