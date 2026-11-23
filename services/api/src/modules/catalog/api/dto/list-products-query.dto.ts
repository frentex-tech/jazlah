import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { PRODUCT_STATUSES } from '../../domain/product-statuses.constants';
import type { ProductStatus } from '../../domain/product-status.type';

/** A vendor's product list: a page, optionally of one status. */
export class ListProductsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: PRODUCT_STATUSES,
    example: 'pending_review',
    description:
      'Only products in this status: `draft` (not yet submitted), `pending_review` (waiting for admin review), `published` (live), `rejected` (sent back with a reason). Left out: every status.',
  })
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;
}
