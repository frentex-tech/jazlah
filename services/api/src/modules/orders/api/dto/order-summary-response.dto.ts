import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_METHOD_NAMES } from '@modules/payments';
import { FULFILMENT_METHODS } from '../../domain/fulfilment-methods.constants';
import { ORDER_STATUSES } from '../../domain/order-statuses.constants';
import { ORDER_TYPES } from '../../domain/order-types.constants';
import { OrderCustomerResponseDto } from './order-customer-response.dto';
import { OrderVendorResponseDto } from './order-vendor-response.dto';

/** An order as a list row, the same for every app. */
export class OrderSummaryResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The order (UUID).',
  })
  id!: string;

  @ApiProperty({
    example: 'JZ-261122-0042',
    description:
      'The order number customers and staff quote: `JZ-` + the Riyadh date `YYMMDD` + `-` + a 4-digit sequence of that day.',
  })
  number!: string;

  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'confirmed',
    description: 'Where the order is.',
  })
  status!: (typeof ORDER_STATUSES)[number];

  @ApiProperty({
    enum: ORDER_TYPES,
    enumName: 'OrderType',
    example: 'carcass',
    description:
      'The kind of order, from its lines; `mixed` for several kinds.',
  })
  orderType!: (typeof ORDER_TYPES)[number];

  @ApiProperty({
    enum: FULFILMENT_METHODS,
    enumName: 'FulfilmentMethod',
    example: 'delivery',
    description: 'Delivered or picked up.',
  })
  fulfilment!: (typeof FULFILMENT_METHODS)[number];

  @ApiProperty({
    example: '2026-11-24',
    description: 'The delivery or pickup day, Riyadh calendar `yyyy-MM-dd`.',
  })
  fulfilmentDate!: string;

  @ApiProperty({
    type: OrderVendorResponseDto,
    description: 'The store that fulfils it.',
  })
  vendor!: OrderVendorResponseDto;

  @ApiProperty({
    type: OrderCustomerResponseDto,
    description: 'Who placed it.',
  })
  customer!: OrderCustomerResponseDto;

  @ApiProperty({
    enum: PAYMENT_METHOD_NAMES,
    enumName: 'PaymentMethod',
    example: 'mada',
    description: 'The method chosen (beside any wallet part).',
  })
  paymentMethod!: (typeof PAYMENT_METHOD_NAMES)[number];

  @ApiProperty({
    type: 'integer',
    example: 196_500,
    description: 'What the customer pays in all, in halalas, VAT included.',
  })
  totalHalalas!: number;

  @ApiProperty({
    example: '2026-11-22T10:00:00.000Z',
    description: 'When it was placed (UTC).',
  })
  createdAt!: Date;
}
