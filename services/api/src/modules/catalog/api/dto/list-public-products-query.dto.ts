import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { trimText } from '@common/dto/trim-text';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

const UUID_EXAMPLE = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

/**
 * The public product list's query (FR-CAT-03): a page and optional filters. The price
 * range applies to a product's lowest size price, both ends included; the text search
 * finds every word of the query in the product's or its store's names, in either language.
 */
export class ListPublicProductsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    minLength: 2,
    maxLength: 100,
    example: 'نعيمي',
    description:
      "Only products where every word of this text (split on spaces, in any order) appears in the product's name or its store's name, in Arabic or English; surrounding spaces are removed, then 2 to 100 characters. Matching ignores Arabic diacritics and tatweel, reads أ إ آ ٱ as ا, ى as ي and ة as ه, and ignores English letter case; `%` and `_` match themselves. Combined with every other filter and the paging. No match: an empty page. Left out: no text search.",
  })
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Length(2, 100)
  q?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: UUID_EXAMPLE,
    description:
      'Only products of this category (its id, a UUID, from GET /v1/public/categories). Left out: every category.',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: UUID_EXAMPLE,
    description:
      'Only products of this vendor (its id, a UUID, from the public vendor list). Left out: every vendor.',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: UUID_EXAMPLE,
    description:
      'Only products of this meat type (its id, a UUID). Left out: every meat type.',
  })
  @IsOptional()
  @IsUUID()
  meatTypeId?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    example: 50000,
    description:
      'Only products whose lowest size price is at least this, in halalas, VAT included (`50000` is 500.00 SAR); included.',
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
    example: 150000,
    description:
      'Only products whose lowest size price is at most this, in halalas, VAT included (`150000` is 1,500.00 SAR); included.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  maxPriceHalalas?: number;
}
