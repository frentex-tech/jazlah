import { ApiProperty } from '@nestjs/swagger';
import { ReferenceItemResponseDto } from './reference-item-response.dto';

/** Every active category, in the display order admins set (not paged). */
export class PublicCategoryListResponseDto {
  @ApiProperty({ type: [ReferenceItemResponseDto] })
  items!: ReferenceItemResponseDto[];
}
