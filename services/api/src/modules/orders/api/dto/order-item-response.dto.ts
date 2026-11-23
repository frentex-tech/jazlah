import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { PRODUCT_PACKAGINGS } from '@modules/catalog';
import { OrderItemSizeResponseDto } from './order-item-size-response.dto';
import { OrderOptionResponseDto } from './order-option-response.dto';

/** One line of an order: the product and options as they were when ordered, and its price. */
export class OrderItemResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The line’s id (UUID).',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e',
    description: 'The product (UUID); it may have changed or gone since.',
  })
  productId!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The product’s name when ordered.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://media.example.com/p/naimi.webp',
    description: 'The product’s first image when ordered; null for none.',
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
    description: 'The chosen packaging; null for none. Names are the apps’.',
  })
  packaging!: (typeof PRODUCT_PACKAGINGS)[number] | null;

  @ApiProperty({
    type: [OrderOptionResponseDto],
    description: 'The "without" items chosen; empty for none.',
  })
  exclusions!: OrderOptionResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'بدون شحم',
    description: 'The customer’s note on the line; null for none.',
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
      'The price of one, size plus options, in halalas (VAT included), as charged.',
  })
  unitPriceHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 194_000,
    description: 'unitPriceHalalas × quantity.',
  })
  totalHalalas!: number;
}
