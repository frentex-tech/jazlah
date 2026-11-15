import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedDescriptionDto } from './localized-description.dto';

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
      'A confirmed upload (purpose vendor.logo) by the signed-in user; null removes the logo.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  logoMediaId?: string | null;

  @ApiPropertyOptional({ type: LocalizedDescriptionDto })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description?: LocalizedDescriptionDto;
}
