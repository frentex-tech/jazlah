import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { PRODUCT_STATUSES } from '../../domain/product-statuses.constants';
import type { ProductStatus } from '../../domain/product-status.type';
import { ProductVendorResponseDto } from './product-vendor-response.dto';

/** A product in a list (public, a vendor's own, or the admins'). */
export class ProductCardResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The product id (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: ProductVendorResponseDto,
    description: 'The vendor selling the product.',
  })
  vendor!: ProductVendorResponseDto;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The product name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The id (UUID) of the product’s category.',
  })
  categoryId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The id (UUID) of the product’s meat type; null when it has none.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  meatTypeId!: string | null;

  @ApiProperty({
    enum: PRODUCT_STATUSES,
    example: 'published',
    description:
      'Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.',
  })
  status!: ProductStatus;

  @ApiProperty({
    example: true,
    description:
      'Whether the product can be ordered now (the vendor’s on and off switch). Public lists hold only available products.',
  })
  isAvailable!: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 95000,
    description:
      'The lowest size price in halalas, VAT included (`95000` is 950.00 SAR), the "from" price of the card; null while the product has no size (a draft).',
  })
  minPriceHalalas!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example:
      'https://cdn.example.com/catalog/product-image/2026/11/16/7f3a.webp',
    description:
      'The public URL of the first image, the cover; null while the product has no image.',
  })
  coverUrl!: string | null;

  @ApiProperty({
    description:
      'When the product was created, UTC ISO 8601; lists are ordered by it, newest first.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;
}
