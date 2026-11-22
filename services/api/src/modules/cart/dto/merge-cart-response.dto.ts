import { ApiProperty } from '@nestjs/swagger';
import { CartResponseDto } from './cart-response.dto';

/** The cart after a guest cart was moved into it. */
export class MergeCartResponseDto {
  @ApiProperty({
    type: CartResponseDto,
    description: 'The account’s cart now.',
  })
  cart!: CartResponseDto;

  @ApiProperty({
    example: false,
    description:
      'True when the account’s cart held another store’s products and was replaced by the guest cart.',
  })
  replacedPreviousCart!: boolean;

  @ApiProperty({
    type: 'integer',
    example: 0,
    description:
      'Guest lines left out because they can no longer be ordered as chosen.',
  })
  skippedCount!: number;
}
