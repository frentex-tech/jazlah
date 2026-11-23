import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import { CuttingPriceDto } from './cutting-price.dto';
import { PackagingPriceDto } from './packaging-price.dto';
import { SizePriceDto } from './size-price.dto';

/** New prices for some sizes, cutting styles and packagings; the others keep theirs. */
export class ChangeProductPricesDto {
  @ApiPropertyOptional({
    type: [SizePriceDto],
    maxItems: PRODUCT_LIMITS.sizes,
    description:
      'New size prices, each size at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.sizeId`); left out or empty: no size price changes.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.sizes)
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  sizes?: SizePriceDto[];

  @ApiPropertyOptional({
    type: [CuttingPriceDto],
    maxItems: PRODUCT_LIMITS.cuttings,
    description:
      'New cutting style extra prices, each cutting style at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`); left out or empty: no cutting price changes.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.cuttings)
  @ValidateNested({ each: true })
  @Type(() => CuttingPriceDto)
  cuttings?: CuttingPriceDto[];

  @ApiPropertyOptional({
    type: [PackagingPriceDto],
    maxItems: PRODUCT_PACKAGINGS.length,
    description:
      'New packaging extra prices, each packaging at most once (VALIDATION_FAILED `isNotRepeated` on `packagings.<i>.packaging`); left out or empty: no packaging price changes.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_PACKAGINGS.length)
  @ValidateNested({ each: true })
  @Type(() => PackagingPriceDto)
  packagings?: PackagingPriceDto[];
}
