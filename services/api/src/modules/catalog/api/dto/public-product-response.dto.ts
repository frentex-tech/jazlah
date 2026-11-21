import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';

import { NamedReferenceResponseDto } from './named-reference-response.dto';
import { IncompatiblePairResponseDto } from './incompatible-pair-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductPackagingResponseDto } from './product-packaging-response.dto';
import { ProductVendorResponseDto } from './product-vendor-response.dto';
import { PublicProductCuttingResponseDto } from './public-product-cutting-response.dto';
import { PublicProductSizeResponseDto } from './public-product-size-response.dto';

/** A product page for anyone (FR-PRD-01 to 05, 07): what it is and every option. */
export class PublicProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The product id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: ProductVendorResponseDto,
    description: 'The vendor selling the product.',
  })
  vendor!: ProductVendorResponseDto;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The product name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: OptionalLocalizedTextResponseDto,
    description:
      'The description in Arabic and English, each null when absent.',
  })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    type: NamedReferenceResponseDto,
    description: 'The product’s category, with its name.',
  })
  category!: NamedReferenceResponseDto;

  @ApiProperty({
    type: NamedReferenceResponseDto,
    nullable: true,
    description:
      'The product’s meat type, with its name; null when it has none.',
  })
  meatType!: NamedReferenceResponseDto | null;

  @ApiProperty({
    enum: PRODUCT_FULFILMENTS,
    example: 'both',
    description:
      'How the product reaches the customer: `delivery`, `pickup` or `both`.',
  })
  fulfilment!: ProductFulfilment;

  @ApiProperty({
    example: true,
    description:
      'Whether the product can be ordered now; `false`: out of stock (the page shows it, nothing can be added). An unavailable product is left out of the public list.',
  })
  isAvailable!: boolean;

  @ApiProperty({
    type: [ProductImageResponseDto],
    description: 'The images in display order, the first is the cover.',
  })
  images!: ProductImageResponseDto[];

  @ApiProperty({
    type: [PublicProductSizeResponseDto],
    description:
      'The sizes to choose from, in display order, each with its approximate weight, price and availability; at least one.',
  })
  sizes!: PublicProductSizeResponseDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The size chosen when the page opens: the first available size in display order; null when no size is available.',
  })
  defaultSizeId!: string | null;

  @ApiProperty({
    type: [PublicProductCuttingResponseDto],
    description:
      'The cutting styles to choose from, with their extra prices; empty when there is no cutting choice. With any, the customer must choose one (OPTION_REQUIRED).',
  })
  cuttings!: PublicProductCuttingResponseDto[];

  @ApiProperty({
    type: [ProductPackagingResponseDto],
    description:
      'The packagings to choose from (`trays`, `bags`, `vacuum`, `none`), with their extra prices; empty when there is no packaging choice.',
  })
  packagings!: ProductPackagingResponseDto[];

  @ApiProperty({
    type: [NamedReferenceResponseDto],
    description: 'The "without" items the customer may ask to leave out.',
  })
  exclusions!: NamedReferenceResponseDto[];

  @ApiProperty({
    type: [IncompatiblePairResponseDto],
    description:
      'Cutting style and packaging pairs among this product’s options that may not be chosen together (admin rules); a line with one is refused (INCOMPATIBLE_CUTTING_PACKAGING). Empty when none applies.',
  })
  incompatiblePairs!: IncompatiblePairResponseDto[];

  @ApiProperty({
    example: 95000,
    description:
      'The lowest size price in halalas, VAT included (`95000` is 950.00 SAR): the "from" price.',
  })
  minPriceHalalas!: number;
}
