import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';
import { NamedReferenceResponseDto } from './named-reference-response.dto';
import { ProductCuttingResponseDto } from './product-cutting-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductSizeResponseDto } from './product-size-response.dto';
import { ProductVendorResponseDto } from './product-vendor-response.dto';

/** A product page for anyone (FR-PRD-01 to 05, 07): what it is and every option. */
export class PublicProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({ type: ProductVendorResponseDto })
  vendor!: ProductVendorResponseDto;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ type: OptionalLocalizedTextResponseDto })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({ type: NamedReferenceResponseDto })
  category!: NamedReferenceResponseDto;

  @ApiProperty({ type: NamedReferenceResponseDto, nullable: true })
  meatType!: NamedReferenceResponseDto | null;

  @ApiProperty({ enum: PRODUCT_FULFILMENTS, example: 'both' })
  fulfilment!: ProductFulfilment;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiProperty({ type: [ProductSizeResponseDto] })
  sizes!: ProductSizeResponseDto[];

  @ApiProperty({ type: [ProductCuttingResponseDto] })
  cuttings!: ProductCuttingResponseDto[];

  @ApiProperty({ enum: PRODUCT_PACKAGINGS, isArray: true, example: ['trays'] })
  packagings!: ProductPackaging[];

  @ApiProperty({ type: [NamedReferenceResponseDto] })
  exclusions!: NamedReferenceResponseDto[];

  @ApiProperty({
    description: 'The lowest size price in halalas.',
    example: 95000,
  })
  minPriceHalalas!: number;
}
