import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

const UUID_EXAMPLE = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

/**
 * The public product list's query (FR-CAT-03): a page and optional filters. The price
 * range applies to a product's lowest size price, both ends included.
 */
export class ListPublicProductsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ format: 'uuid', example: UUID_EXAMPLE })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ format: 'uuid', example: UUID_EXAMPLE })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ format: 'uuid', example: UUID_EXAMPLE })
  @IsOptional()
  @IsUUID()
  meatTypeId?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description: 'Halalas.',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  minPriceHalalas?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description: 'Halalas.',
    example: 150000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  maxPriceHalalas?: number;
}
