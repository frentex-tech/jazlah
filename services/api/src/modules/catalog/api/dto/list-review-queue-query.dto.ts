import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { REVIEW_QUEUE_KINDS } from '../../domain/review-queue-kinds.constants';
import type { ReviewQueueKind } from '../../domain/review-queue-kind.type';

/** The admins' review queue: a page, optionally of one kind and one vendor. */
export class ListReviewQueueQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: REVIEW_QUEUE_KINDS,
    example: 'product',
    description:
      '`product`: only new products waiting for review; `change_request`: only edits of published products. Left out: both.',
  })
  @IsOptional()
  @IsIn(REVIEW_QUEUE_KINDS)
  kind?: ReviewQueueKind;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'Only the items of this vendor (its id, a UUID). Left out: every vendor.',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;
}
