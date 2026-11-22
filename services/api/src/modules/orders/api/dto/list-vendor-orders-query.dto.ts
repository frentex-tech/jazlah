import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { trimText } from '@common/dto/trim-text';
import { PAYMENT_METHOD_NAMES } from '@modules/payments';
import { ORDER_STATUSES } from '../../domain/order-statuses.constants';

/** The vendor’s orders, filtered. */
export class ListVendorOrdersQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'new',
    description: 'Only orders in this status.',
  })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({
    enum: PAYMENT_METHOD_NAMES,
    enumName: 'PaymentMethod',
    example: 'cod',
    description:
      'Only orders with this method (`cod` with status `new`: the cash-on-delivery review queue).',
  })
  @IsOptional()
  @IsIn(PAYMENT_METHOD_NAMES)
  paymentMethod?: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiPropertyOptional({
    example: '2026-11-24',
    description: 'Only orders for this delivery or pickup day, `yyyy-MM-dd`.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'isCalendarDate' })
  @IsISO8601({ strict: true })
  fulfilmentDate?: string;

  @ApiPropertyOptional({
    example: 'JZ-261122',
    description:
      'The order number, or part of the customer’s name or mobile; 1 to 100 characters after trimming.',
  })
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Length(1, 100)
  q?: string;
}
