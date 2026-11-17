import { ApiProperty } from '@nestjs/swagger';
import { NamedReferenceResponseDto } from './named-reference-response.dto';

/** Every active entry of a list, for a vendor's picker (not paged). */
export class NamedReferenceListResponseDto {
  @ApiProperty({
    type: [NamedReferenceResponseDto],
    description:
      'Every active entry, with its Arabic and English name, oldest first; empty when there is none.',
  })
  items!: NamedReferenceResponseDto[];
}
