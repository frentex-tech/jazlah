import { ApiProperty } from '@nestjs/swagger';
import { ReferenceItemResponseDto } from './reference-item-response.dto';

/** Every active category, in the display order admins set (not paged). */
export class PublicCategoryListResponseDto {
  @ApiProperty({
    type: [ReferenceItemResponseDto],
    description:
      'Every active category, by `sortOrder` (lower first), then oldest first; empty when there is none.',
  })
  items!: ReferenceItemResponseDto[];
}
