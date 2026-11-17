import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsIn,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedDescriptionDto } from '@common/dto/localized-description.dto';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';
import { ProductCuttingDto } from './product-cutting.dto';
import { ProductSizeDto } from './product-size.dto';

const UUID_EXAMPLE = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

/**
 * A product's whole content, replaced as one: names, category, meat type, images, sizes,
 * cutting styles, packagings and "without" items. Lists are in display order. A draft
 * may be incomplete; submitting needs a size and an image.
 */
export class ProductContentDto {
  @ApiProperty({
    type: LocalizedNameDto,
    description: 'The product name in Arabic and English, as customers see it.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

  @ApiPropertyOptional({
    type: LocalizedDescriptionDto,
    description:
      'An optional longer description in Arabic, English, both or neither; left out: none. The whole content is replaced, so on an edit send the description again to keep it.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description?: LocalizedDescriptionDto;

  @ApiProperty({
    format: 'uuid',
    example: UUID_EXAMPLE,
    description:
      'The id (UUID) of an active category (GET /v1/public/categories); another one is VALIDATION_FAILED `isActiveCategory`.',
  })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    example: UUID_EXAMPLE,
    description:
      'The id (UUID) of an active meat type, or null or left out for none; an inactive or unknown one is VALIDATION_FAILED `isActiveMeatType`.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  meatTypeId?: string | null;

  @ApiProperty({
    type: [String],
    maxItems: PRODUCT_LIMITS.images,
    example: [UUID_EXAMPLE],
    description:
      'The images, as media ids (UUIDs) in display order, the first is the cover; at most 10, no repeats. Each new one is a `catalog.product-image` upload the signed-in user made and confirmed (MEDIA_NOT_FOUND, MEDIA_NOT_READY otherwise); the product’s current images may be kept as they are. Empty is allowed on a draft; submitting needs at least one.',
  })
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.images)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  imageMediaIds!: string[];

  @ApiProperty({
    type: [ProductSizeDto],
    maxItems: PRODUCT_LIMITS.sizes,
    description:
      'The sizes, in display order, at most 20. An existing size is kept by sending its `id` (at most once, VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.id`; an id not of this product is `isSizeOfProduct`) and keeps its live price; one left out is removed; one without `id` is new. Empty is allowed on a draft; submitting needs at least one.',
  })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.sizes)
  @ValidateNested({ each: true })
  @Type(() => ProductSizeDto)
  sizes!: ProductSizeDto[];

  @ApiProperty({
    type: [ProductCuttingDto],
    maxItems: PRODUCT_LIMITS.cuttings,
    description:
      'The cutting styles offered, in display order, at most 30, each at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`). Empty: no cutting choice.',
  })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.cuttings)
  @ValidateNested({ each: true })
  @Type(() => ProductCuttingDto)
  cuttings!: ProductCuttingDto[];

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    isArray: true,
    example: ['trays', 'vacuum'],
    description:
      'The packagings offered, each at most once: `trays`, `bags`, `vacuum`, `none`. A cutting style offered with a packaging an admin rule forbids blocks submission (PRODUCT_NOT_SUBMITTABLE, INCOMPATIBLE_CUTTING_PACKAGING).',
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(PRODUCT_PACKAGINGS, { each: true })
  packagings!: ProductPackaging[];

  @ApiProperty({
    type: [String],
    maxItems: PRODUCT_LIMITS.exclusions,
    example: [UUID_EXAMPLE],
    description:
      'The ids (UUIDs) of the active "without" items a customer may ask to leave out, at most 30, no repeats; an inactive or unknown one is VALIDATION_FAILED `isActiveExclusionItem`.',
  })
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.exclusions)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  exclusionItemIds!: string[];
}
