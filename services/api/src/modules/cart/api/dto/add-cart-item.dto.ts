import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CartItemInputDto } from './cart-item-input.dto';

/** Adds a line to the cart (the same configuration adds to its quantity). */
export class AddCartItemDto extends CartItemInputDto {
  @ApiPropertyOptional({
    example: false,
    description:
      '`true`: when the cart holds another store’s products, empty it first (after the customer agreed); left out or false: CART_VENDOR_MISMATCH instead.',
  })
  @IsOptional()
  @IsBoolean()
  replaceCart?: boolean;
}
