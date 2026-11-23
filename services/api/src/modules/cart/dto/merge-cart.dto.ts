import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CartItemInputDto } from './cart-item-input.dto';

/** Moves the guest cart into the account after sign-in. */
export class MergeCartDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'A UUID made once per guest cart: repeating the merge with it answers the first result and adds nothing.',
  })
  @IsUUID()
  mergeId!: string;

  @ApiProperty({
    type: [CartItemInputDto],
    maxItems: 50,
    description: 'The guest cart’s lines, at most 50.',
  })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  items!: CartItemInputDto[];
}
