import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PRODUCT_FULFILMENTS } from '../../domain/product-fulfilments.constants';
import type { ProductFulfilment } from '../../domain/product-fulfilment.type';
import { ProductContentDto } from './product-content.dto';

/** A new draft product: its content and how it reaches the customer. */
export class CreateProductDto extends ProductContentDto {
  @ApiProperty({ enum: PRODUCT_FULFILMENTS, example: 'both' })
  @IsIn(PRODUCT_FULFILMENTS)
  fulfilment!: ProductFulfilment;
}
