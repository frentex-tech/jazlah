import { ApiProperty } from '@nestjs/swagger';
import { ReviewQueueItemResponseDto } from './review-queue-item-response.dto';

/** One page of the review queue, newest submission first, and how many wait in all. */
export class ReviewQueuePageResponseDto {
  @ApiProperty({
    type: [ReviewQueueItemResponseDto],
    description:
      'The items of this page, newest submission first; empty when none wait.',
  })
  items!: ReviewQueueItemResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;

  @ApiProperty({
    example: 7,
    description:
      'How many items wait in all for this filter (every page, not this page): the side-nav badge.',
  })
  count!: number;
}
