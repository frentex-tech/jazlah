import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { trimText } from '@common/dto/trim-text';
import { COUPON_STATUSES } from '../coupon-statuses.constants';

/** Coupons, filtered. */
export class ListCouponsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: COUPON_STATUSES,
    example: 'active',
    description: 'Only coupons in this state.',
  })
  @IsOptional()
  @IsIn(COUPON_STATUSES)
  status?: (typeof COUPON_STATUSES)[number];

  @ApiPropertyOptional({
    example: 'EID',
    description: 'Part of the code, any case, 1 to 32 characters.',
  })
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Length(1, 32)
  q?: string;
}
