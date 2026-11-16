import { ApiProperty } from '@nestjs/swagger';
import { ReferenceItemResponseDto } from './reference-item-response.dto';

/** One page of list entries, newest first. */
export class ReferenceItemPageResponseDto {
  @ApiProperty({ type: [ReferenceItemResponseDto] })
  items!: ReferenceItemResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
