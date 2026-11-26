import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { trimText } from '@common/dto/trim-text';

/** Applies a coupon to the cart. */
export class ApplyCouponDto {
  @ApiProperty({
    example: 'EID15',
    description: 'The code, any case, 3 to 32 characters.',
  })
  @Transform(trimText)
  @IsString()
  @Length(3, 32)
  code!: string;
}
