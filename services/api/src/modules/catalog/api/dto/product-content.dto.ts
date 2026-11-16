import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
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
  @ApiProperty({ type: LocalizedNameDto })
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

  @ApiPropertyOptional({ type: LocalizedDescriptionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description?: LocalizedDescriptionDto;

  @ApiProperty({
    format: 'uuid',
    description: 'An active category.',
    example: UUID_EXAMPLE,
  })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'An active meat type, or null for none.',
    example: UUID_EXAMPLE,
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  meatTypeId?: string | null;

  @ApiProperty({
    type: [String],
    maxItems: PRODUCT_LIMITS.images,
    description:
      'Confirmed uploads (purpose catalog.product-image) by the signed-in user, first is the cover.',
    example: [UUID_EXAMPLE],
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
      'Each existing size id at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.id`).',
  })
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.sizes)
  @ValidateNested({ each: true })
  @Type(() => ProductSizeDto)
  sizes!: ProductSizeDto[];

  @ApiProperty({
    type: [ProductCuttingDto],
    maxItems: PRODUCT_LIMITS.cuttings,
    description:
      'Each cutting style at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`).',
  })
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.cuttings)
  @ValidateNested({ each: true })
  @Type(() => ProductCuttingDto)
  cuttings!: ProductCuttingDto[];

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    isArray: true,
    example: ['trays', 'vacuum'],
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(PRODUCT_PACKAGINGS, { each: true })
  packagings!: ProductPackaging[];

  @ApiProperty({
    type: [String],
    maxItems: PRODUCT_LIMITS.exclusions,
    description: 'Active "without" items.',
    example: [UUID_EXAMPLE],
  })
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.exclusions)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  exclusionItemIds!: string[];
}
