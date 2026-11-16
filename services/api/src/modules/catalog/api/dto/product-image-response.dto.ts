import { ApiProperty } from '@nestjs/swagger';

/** A product image: its file and public URL. */
export class ProductImageResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  mediaId!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://cdn.example.com/catalog/product-image/2026/11/16/7f3a.webp',
  })
  url!: string | null;
}
