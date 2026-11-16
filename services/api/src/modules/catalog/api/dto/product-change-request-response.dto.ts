import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_CHANGE_REQUEST_STATUSES } from '../../domain/product-change-request-statuses.constants';
import type { ProductChangeRequestStatus } from '../../domain/product-change-request-status.type';
import { ProductContentResponseDto } from './product-content-response.dto';

/** A change request on a published product. */
export class ProductChangeRequestResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  productId!: string;

  @ApiProperty({ enum: PRODUCT_CHANGE_REQUEST_STATUSES, example: 'pending' })
  status!: ProductChangeRequestStatus;

  @ApiProperty({ type: ProductContentResponseDto })
  content!: ProductContentResponseDto;

  @ApiProperty({ type: String, nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-11-16T09:05:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: Date, nullable: true, example: null })
  reviewedAt!: Date | null;
}
