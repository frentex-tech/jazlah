import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A new extra price for one of the product's packagings. */
export class PackagingPriceDto {
  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description:
      'A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.',
  })
  @IsIn(PRODUCT_PACKAGINGS)
  packaging!: ProductPackaging;

  @ApiProperty({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    example: 500,
    description:
      'The new extra price for this packaging, in halalas, VAT included (`500` is 5.00 SAR); 0 for no extra charge.',
  })
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  extraPriceHalalas!: number;
}
