import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { CuttingPriceDto } from './cutting-price.dto';
import { SizePriceDto } from './size-price.dto';

/** New prices for some sizes and cutting styles; the others keep theirs. */
export class ChangeProductPricesDto {
  @ApiPropertyOptional({
    type: [SizePriceDto],
    maxItems: PRODUCT_LIMITS.sizes,
    description:
      'Each size at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.sizeId`).',
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
      'Each cutting style at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.cuttings)
  @ValidateNested({ each: true })
  @Type(() => CuttingPriceDto)
  cuttings?: CuttingPriceDto[];
}
