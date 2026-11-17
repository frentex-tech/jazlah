import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A packaging a product offers (FR-PRD-04), with its extra price. */
export class ProductPackagingDto {
  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description:
      'The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style offered with a packaging an admin rule forbids blocks submission (PRODUCT_NOT_SUBMITTABLE, INCOMPATIBLE_CUTTING_PACKAGING).',
  })
  @IsIn(PRODUCT_PACKAGINGS)
  packaging!: ProductPackaging;

  @ApiProperty({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    example: 500,
    description:
      'The extra price in halalas, VAT included (`500` is 5.00 SAR); 0 for none. A packaging the product already offers keeps its live extra price here (VALIDATION_FAILED `isLivePrice` otherwise): change it with the prices endpoint.',
  })
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  extraPriceHalalas!: number;
}
