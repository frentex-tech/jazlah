import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_CHANGE_REQUEST_STATUSES } from '../../domain/product-change-request-statuses.constants';
import type { ProductChangeRequestStatus } from '../../domain/product-change-request-status.type';
import { ProductContentResponseDto } from './product-content-response.dto';

/** A change request on a published product. */
export class ProductChangeRequestResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The change request id (UUID): approve or reject it with this id.',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of the published product the request would change.',
  })
  productId!: string;

  @ApiProperty({
    enum: PRODUCT_CHANGE_REQUEST_STATUSES,
    example: 'pending',
    description:
      '`pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.',
  })
  status!: ProductChangeRequestStatus;

  @ApiProperty({
    type: ProductContentResponseDto,
    description:
      'The content as the vendor proposed it. Prices of sizes and cuttings the product already has are as they were then: approval keeps their live prices (see the product), and only new sizes and cuttings take the prices shown.',
  })
  content!: ProductContentResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description:
      'The admin’s reason, shown to the vendor; set only when `status` is `rejected`, otherwise null.',
  })
  rejectionReason!: string | null;

  @ApiProperty({
    description: 'When the vendor sent the edit, UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When the request last changed status, UTC ISO 8601.',
    example: '2026-11-15T10:05:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: null,
    description:
      'When an admin approved or rejected it, UTC ISO 8601; null while pending and for a superseded request.',
  })
  reviewedAt!: Date | null;
}
