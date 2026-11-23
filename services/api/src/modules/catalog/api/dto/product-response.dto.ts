import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';

import { PRODUCT_STATUSES } from '../../domain/product-statuses.constants';
import type { ProductStatus } from '../../domain/product-status.type';
import { NamedReferenceResponseDto } from './named-reference-response.dto';
import { ProductChangeRequestResponseDto } from './product-change-request-response.dto';
import { ProductCuttingResponseDto } from './product-cutting-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductPackagingResponseDto } from './product-packaging-response.dto';
import { ProductSizeResponseDto } from './product-size-response.dto';

/**
 * A product as its vendor or an admin sees it: live, with its review state and its
 * latest change request.
 */
export class ProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The product id (UUID).',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of the vendor that sells it (the platform vendor for JAZLA’s own products).',
  })
  vendorId!: string;

  @ApiProperty({
    enum: PRODUCT_STATUSES,
    example: 'published',
    description:
      'Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.',
  })
  status!: ProductStatus;

  @ApiProperty({
    example: true,
    description:
      'Whether the product can be ordered now (the on and off switch); an unavailable product is hidden from the public catalog.',
  })
  isAvailable!: boolean;

  @ApiProperty({
    enum: PRODUCT_FULFILMENTS,
    example: 'both',
    description:
      'How the product reaches the customer: `delivery`, `pickup` or `both`.',
  })
  fulfilment!: ProductFulfilment;

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
    type: [ProductImageResponseDto],
    description: 'The images in display order, the first is the cover.',
  })
  images!: ProductImageResponseDto[];

  @ApiProperty({
    type: [ProductSizeResponseDto],
    description: 'The sizes in display order, with their live prices.',
  })
  sizes!: ProductSizeResponseDto[];

  @ApiProperty({
    type: [ProductCuttingResponseDto],
    description:
      'The cutting styles offered, in display order, with their names and extra prices.',
  })
  cuttings!: ProductCuttingResponseDto[];

  @ApiProperty({
    type: [ProductPackagingResponseDto],
    description:
      'The packagings offered (`trays`, `bags`, `vacuum`, `none`), with their extra prices.',
  })
  packagings!: ProductPackagingResponseDto[];

  @ApiProperty({
    type: [NamedReferenceResponseDto],
    description:
      'The "without" items a customer may ask to leave out, with their names.',
  })
  exclusions!: NamedReferenceResponseDto[];

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 95000,
    description:
      'The lowest size price in halalas, VAT included (`95000` is 950.00 SAR); null while there is no size.',
  })
  minPriceHalalas!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description:
      'The admin’s reason for sending the product back, for the vendor to read; set only while `status` is `rejected`, otherwise null.',
  })
  rejectionReason!: string | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: null,
    description:
      'When the vendor last sent it to review, UTC ISO 8601; null if never submitted (JAZLA products are never submitted).',
  })
  submittedAt!: Date | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: null,
    description:
      'When an admin last approved, rejected or (JAZLA products) published it, UTC ISO 8601; null before.',
  })
  reviewedAt!: Date | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: null,
    description: 'When it was published, UTC ISO 8601; null until then.',
  })
  publishedAt!: Date | null;

  @ApiProperty({
    description: 'When the product was created, UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When the product last changed, UTC ISO 8601.',
    example: '2026-11-15T10:05:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: ProductChangeRequestResponseDto,
    nullable: true,
    description:
      'The latest change request of this product: the pending one (its proposed content waiting for review), or the last decided one (approved, rejected with its reason, or superseded); null when there has never been one. Filled by the product reads (GET) and by a content edit (PUT); the other writes answer null here even when a request exists, so read the product again to show it.',
  })
  changeRequest!: ProductChangeRequestResponseDto | null;
}
