import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ORDER_SCOPES } from '../../domain/order-scopes.constants';

/** The customer’s orders, one tab or both. */
export class ListCustomerOrdersQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: ORDER_SCOPES,
    example: 'current',
    description: '`current` or `past`; left out: both.',
  })
  @IsOptional()
  @IsIn(ORDER_SCOPES)
  scope?: (typeof ORDER_SCOPES)[number];
}
