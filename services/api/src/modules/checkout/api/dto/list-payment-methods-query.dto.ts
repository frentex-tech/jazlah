import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/** What the methods are for. */
export class ListPaymentMethodsQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'An unpaid order of the customer (UUID), to pay again; left out: the cart.',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;
}
