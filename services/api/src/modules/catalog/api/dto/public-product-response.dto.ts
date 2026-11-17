import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';

import { NamedReferenceResponseDto } from './named-reference-response.dto';
import { ProductCuttingResponseDto } from './product-cutting-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductPackagingResponseDto } from './product-packaging-response.dto';
import { ProductSizeResponseDto } from './product-size-response.dto';
import { ProductVendorResponseDto } from './product-vendor-response.dto';

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
    type: [ProductImageResponseDto],
    description: 'The images in display order, the first is the cover.',
  })
  images!: ProductImageResponseDto[];

  @ApiProperty({
    type: [ProductSizeResponseDto],
    description:
      'The sizes to choose from, in display order, each with its approximate weight and price; at least one.',
  })
  sizes!: ProductSizeResponseDto[];

  @ApiProperty({
    type: [ProductCuttingResponseDto],
    description:
      'The cutting styles to choose from, with their extra prices; empty when there is no cutting choice.',
  })
  cuttings!: ProductCuttingResponseDto[];

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
    example: 95000,
    description:
      'The lowest size price in halalas, VAT included (`95000` is 950.00 SAR): the "from" price.',
  })
  minPriceHalalas!: number;
}
