import { ApiProperty } from '@nestjs/swagger';
import { CartCouponResponseDto } from './cart-coupon-response.dto';
import { CartFulfilmentResponseDto } from './cart-fulfilment-response.dto';
import { CartIssueResponseDto } from './cart-issue-response.dto';
import { CartLineResponseDto } from './cart-line-response.dto';
import { CartVendorResponseDto } from './cart-vendor-response.dto';

/** The customer’s cart, priced today: one store, its lines, coupon, fulfilment and totals. */
export class CartResponseDto {
  @ApiProperty({
    type: CartVendorResponseDto,
    nullable: true,
    description: 'The store; null while the cart is empty.',
  })
  vendor!: CartVendorResponseDto | null;

  @ApiProperty({
    type: [CartLineResponseDto],
    description: 'The lines, in the order added; empty for an empty cart.',
  })
  lines!: CartLineResponseDto[];

  @ApiProperty({
    type: CartCouponResponseDto,
    nullable: true,
    description:
      'The coupon applied; null for none. A coupon that stopped applying is removed and absent.',
  })
  coupon!: CartCouponResponseDto | null;

  @ApiProperty({
    type: CartFulfilmentResponseDto,
    nullable: true,
    description:
      'The fulfilment chosen; null until set (PATCH /v1/customer/cart/fulfilment).',
  })
  fulfilment!: CartFulfilmentResponseDto | null;

  @ApiProperty({
    type: 'integer',
    example: 194_000,
    description: 'The lines’ total, in halalas, VAT included.',
  })
  subtotalHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 0,
    description: 'The coupon discount; 0 for none.',
  })
  discountHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 2500,
    description: 'The delivery fee; 0 unless delivery is chosen.',
  })
  deliveryFeeHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 196_500,
    description: 'subtotal − discount + delivery fee.',
  })
  totalHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 25630,
    description: 'The VAT inside the total: round half up of total × 15 / 115.',
  })
  vatHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 10000,
    description:
      'The smallest order, compared with the subtotal before the discount.',
  })
  minOrderHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 0,
    description:
      'How much more is needed to reach the minimum; 0 once reached.',
  })
  minOrderRemainingHalalas!: number;

  @ApiProperty({
    type: [CartIssueResponseDto],
    description: 'What blocks checkout on its lines; empty for none.',
  })
  issues!: CartIssueResponseDto[];

  @ApiProperty({
    example: true,
    description:
      'True when there are lines, no issues and the minimum is reached.',
  })
  canCheckout!: boolean;
}
