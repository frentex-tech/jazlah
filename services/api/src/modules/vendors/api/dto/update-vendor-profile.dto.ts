import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedDescriptionDto } from '@common/dto/localized-description.dto';

/**
 * A vendor's changes to its own profile (FR-VND-02). A field left out stays as it is.
 * `logoMediaId: null` removes the logo; `description` is an object, never null (a
 * language set to null inside it clears that language).
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
