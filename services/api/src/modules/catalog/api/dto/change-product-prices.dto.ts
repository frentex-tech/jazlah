import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { CuttingPriceDto } from './cutting-price.dto';
import { SizePriceDto } from './size-price.dto';

/** New prices for some sizes and cutting styles; the others keep theirs. */
export class ChangeProductPricesDto {
  @ApiPropertyOptional({ type: [SizePriceDto], maxItems: PRODUCT_LIMITS.sizes })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.sizes)
  @ArrayUnique((size: SizePriceDto) => size.sizeId)
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  sizes?: SizePriceDto[];

  @ApiPropertyOptional({
    type: [CuttingPriceDto],
    maxItems: PRODUCT_LIMITS.cuttings,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.cuttings)
  @ArrayUnique((cutting: CuttingPriceDto) => cutting.cuttingStyleId)
  @ValidateNested({ each: true })
  @Type(() => CuttingPriceDto)
  cuttings?: CuttingPriceDto[];
}
