import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { PRODUCT_PACKAGINGS } from '@modules/catalog';
import {
  OrderItemSizeResponseDto,
  OrderOptionResponseDto,
} from '@modules/orders';

/** One line of the cart, priced today. */
export class CartLineResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The line (UUID).',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e',
    description: 'The product (UUID).',
  })
  productId!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The product’s name.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://media.example.com/p/naimi.webp',
    description: 'The product’s first image; null for none.',
  })
  imageUrl!: string | null;

  @ApiProperty({
    type: OrderItemSizeResponseDto,
    description: 'The chosen size.',
  })
  size!: OrderItemSizeResponseDto;

  @ApiProperty({
    type: OrderOptionResponseDto,
    nullable: true,
    description: 'The chosen cutting style; null for none.',
  })
  cutting!: OrderOptionResponseDto | null;

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    nullable: true,
    example: 'vacuum',
    description: 'The chosen packaging; null for none.',
  })
  packaging!: (typeof PRODUCT_PACKAGINGS)[number] | null;

  @ApiProperty({
    type: [OrderOptionResponseDto],
    description: 'The "without" items; empty for none.',
  })
  exclusions!: OrderOptionResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'The line’s note; null for none.',
  })
  notes!: string | null;

  @ApiProperty({
    type: 'integer',
    example: 2,
    description: 'How many.',
  })
  quantity!: number;

  @ApiProperty({
    type: 'integer',
    example: 97000,
    description:
      'The price of one as accepted (when added or last updated), in halalas, VAT included.',
  })
  unitPriceHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 194_000,
    description: 'unitPriceHalalas × quantity.',
  })
  totalHalalas!: number;

  @ApiProperty({
    example: true,
    description:
      'Whether it can still be ordered as chosen; `false`: the ITEM_UNAVAILABLE issue.',
  })
  isAvailable!: boolean;
}
