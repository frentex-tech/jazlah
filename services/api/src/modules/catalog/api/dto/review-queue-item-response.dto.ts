import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { REVIEW_QUEUE_KINDS } from '../../domain/review-queue-kinds.constants';
import type { ReviewQueueKind } from '../../domain/review-queue-kind.type';
import { ProductVendorResponseDto } from './product-vendor-response.dto';

/** One item waiting for an admin's review. */
export class ReviewQueueItemResponseDto {
  @ApiProperty({
    enum: REVIEW_QUEUE_KINDS,
    example: 'product',
    description:
      '`product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).',
  })
  kind!: ReviewQueueKind;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The product id (UUID): open it with GET /v1/admin/products/{id}.',
  })
  productId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    example: null,
    description:
      'The change request’s id (UUID) for `change_request`, its content in GET /v1/admin/product-change-requests; null for `product`.',
  })
  changeRequestId!: string | null;

  @ApiProperty({
    type: ProductVendorResponseDto,
    description: 'The vendor who sent it, with the store name.',
  })
  vendor!: ProductVendorResponseDto;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description:
      'The product’s live name in Arabic and English (an edit may propose another).',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    example: '2026-11-21T09:30:00.000Z',
    description:
      'When it entered the queue, UTC ISO 8601: the product’s submission, or the vendor’s edit that opened the request.',
  })
  submittedAt!: Date;
}
