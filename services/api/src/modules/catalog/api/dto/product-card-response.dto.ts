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
  })
  id!: string;

  @ApiProperty({ type: ProductVendorResponseDto })
  vendor!: ProductVendorResponseDto;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  categoryId!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, example: null })
  meatTypeId!: string | null;

  @ApiProperty({ enum: PRODUCT_STATUSES, example: 'published' })
  status!: ProductStatus;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'The lowest size price in halalas; null while there is no size.',
    example: 95000,
  })
  minPriceHalalas!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The first image; null while there is none.',
    example:
      'https://cdn.example.com/catalog/product-image/2026/11/16/7f3a.webp',
  })
  coverUrl!: string | null;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  createdAt!: Date;
}
