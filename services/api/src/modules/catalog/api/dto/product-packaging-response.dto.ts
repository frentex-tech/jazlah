import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A packaging a product offers, with its extra price. */
export class ProductPackagingResponseDto {
  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description: 'The packaging: `trays`, `bags`, `vacuum`, `none`.',
  })
  packaging!: ProductPackaging;

  @ApiProperty({
    example: 500,
    description:
      'The extra price for this packaging, in halalas, VAT included (`500` is 5.00 SAR); 0 for no extra charge.',
  })
  extraPriceHalalas!: number;
}
