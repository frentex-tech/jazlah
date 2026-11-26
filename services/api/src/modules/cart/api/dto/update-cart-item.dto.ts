import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

/** Changes a line’s quantity, accepting today’s price. */
export class UpdateCartItemDto {
  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 99,
    example: 2,
    description:
      'The new quantity, 1 to 99. Sending the same quantity accepts a changed price (clears PRICE_CHANGED).',
  })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
