import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';
import { PRODUCT_STATUSES } from '../../domain/product-statuses.constants';
import type { ProductStatus } from '../../domain/product-status.type';
import { NamedReferenceResponseDto } from './named-reference-response.dto';
import { ProductChangeRequestResponseDto } from './product-change-request-response.dto';
import { ProductCuttingResponseDto } from './product-cutting-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductSizeResponseDto } from './product-size-response.dto';

/**
 * A product as its vendor or an admin sees it: live, with its review state and its
 * latest change request.
 */
export class ProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  vendorId!: string;

  @ApiProperty({ enum: PRODUCT_STATUSES, example: 'published' })
  status!: ProductStatus;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ enum: PRODUCT_FULFILMENTS, example: 'both' })
  fulfilment!: ProductFulfilment;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ type: OptionalLocalizedTextResponseDto })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({ type: NamedReferenceResponseDto })
  category!: NamedReferenceResponseDto;

  @ApiProperty({ type: NamedReferenceResponseDto, nullable: true })
  meatType!: NamedReferenceResponseDto | null;

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
    type: Number,
    nullable: true,
    description:
      'The lowest size price in halalas; null while there is no size.',
    example: 95000,
  })
  minPriceHalalas!: number | null;

  @ApiProperty({ type: String, nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ type: Date, nullable: true, example: null })
  submittedAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true, example: null })
  reviewedAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true, example: null })
  publishedAt!: Date | null;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({
    type: ProductChangeRequestResponseDto,
    nullable: true,
    description:
      'The latest change request: pending, or the last decided one with its reason; null for none.',
  })
  changeRequest!: ProductChangeRequestResponseDto | null;
}
