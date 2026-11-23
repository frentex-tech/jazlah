import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { MAX_SORT_ORDER } from '../../domain/ordered-reference-lists.constants';

/** A new entry of an admin list: its name in both languages; a category's order. */
export class CreateReferenceItemDto {
  @ApiProperty({
    type: LocalizedNameDto,
    description:
      'The entry’s name in Arabic and English, as vendors and customers see it.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: MAX_SORT_ORDER,
    description:
      'Categories only: the display order, lower first (0 by default). Another list refuses it (VALIDATION_FAILED `isOrderedList`).',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SORT_ORDER)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'Categories only: the image, the id (UUID) of a `catalog.category-image` file the signed-in admin uploaded and confirmed (MEDIA_NOT_FOUND, MEDIA_NOT_READY otherwise); left out or null: no image. Another list refuses it, even null (VALIDATION_FAILED `isCategoryList`).',
  })
  @IsOptional()
  @IsUUID()
  imageMediaId?: string | null;
}
