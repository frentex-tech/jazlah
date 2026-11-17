import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** An entry of an admin list (or a public category). */
export class ReferenceItemResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The entry’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The entry’s name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    example: true,
    description:
      'Whether the entry can be chosen for a product; an inactive category also hides its products from the public. The public category list holds only active ones.',
  })
  isActive!: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'A category’s display order, lower first; null for the other lists.',
    example: 0,
  })
  sortOrder!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://cdn.example.com/catalog/category-image/2026/11/17/7f3a.webp',
    description:
      'A category’s image, its public URL; null without an image, and for the other lists.',
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'When the entry was added, UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;
}
