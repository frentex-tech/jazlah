import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';

/** How a product reaches the customer (FR-PRD-07). */
export class SetProductFulfilmentDto {
  @ApiProperty({
    enum: PRODUCT_FULFILMENTS,
    example: 'pickup',
    description:
      'How the product reaches the customer: `delivery`, `pickup` or `both`.',
  })
  @IsIn(PRODUCT_FULFILMENTS)
  fulfilment!: ProductFulfilment;
}
