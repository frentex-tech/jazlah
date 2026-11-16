import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A size in a product's content (FR-PRD-02). */
export class ProductSizeDto {
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'An existing size of the product to keep (its id); left out or null for a new size.',
    example: null,
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsUUID()
  id?: string | null;

  @ApiProperty({
    minimum: 1,
    maximum: PRODUCT_LIMITS.maxWeightGrams,
    description: 'The approximate weight in grams.',
    example: 8000,
  })
  @IsInt()
  @Min(1)
  @Max(PRODUCT_LIMITS.maxWeightGrams)
  approxWeightGrams!: number;

  @ApiProperty({
    minimum: 1,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description:
      'The price in halalas, VAT included. An existing size keeps its live price here (VALIDATION_FAILED `isLivePrice` otherwise): change it with the prices endpoint.',
    example: 95000,
  })
  @IsInt()
  @Min(1)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  priceHalalas!: number;

  @ApiPropertyOptional({
    type: LocalizedNameDto,
    nullable: true,
    description: 'An optional tag, such as “enough for an aqiqah”.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  tag?: LocalizedNameDto | null;
}
