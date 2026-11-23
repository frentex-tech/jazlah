import { ApiProperty } from '@nestjs/swagger';

/** A product image: its file and public URL. */
export class ProductImageResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The media id (UUID) of the image: send it back in `imageMediaIds` to keep the image in a content edit.',
  })
  mediaId!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://cdn.example.com/catalog/product-image/2026/11/16/7f3a.webp',
    description:
      'The public URL of the image; null only while the file cannot be served (not confirmed or removed).',
  })
  url!: string | null;
}
