import { ApiProperty } from '@nestjs/swagger';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { PAYMENT_METHOD_NAMES } from '@modules/payments';
import { FULFILMENT_METHODS } from '../../domain/fulfilment-methods.constants';
import { ORDER_STATUSES } from '../../domain/order-statuses.constants';
import { ORDER_TYPES } from '../../domain/order-types.constants';
import { OrderAddressResponseDto } from './order-address-response.dto';
import { OrderCustomerResponseDto } from './order-customer-response.dto';
import { OrderHistoryEntryResponseDto } from './order-history-entry-response.dto';
import { OrderItemResponseDto } from './order-item-response.dto';
import { OrderPaymentSummaryResponseDto } from './order-payment-summary-response.dto';
import { OrderRefundResponseDto } from './order-refund-response.dto';
import { OrderVendorResponseDto } from './order-vendor-response.dto';
import { PickupPointResponseDto } from './pickup-point-response.dto';

/** One order, the same shape for the customer app and the dashboard: the list row plus its lines, place, money, payment, refunds and history. */
export class OrderResponseDto {
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

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'The lines, in the order added.',
  })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    type: OrderAddressResponseDto,
    nullable: true,
    description: 'The delivery address as placed; null for pickup.',
  })
  address!: OrderAddressResponseDto | null;

  @ApiProperty({
    type: PickupPointResponseDto,
    nullable: true,
    description: 'Where to collect it; null for delivery.',
  })
  pickupPoint!: PickupPointResponseDto | null;

  @ApiProperty({
    type: TimeWindowDto,
    nullable: true,
    description:
      'The delivery window, Riyadh time; null for pickup (see pickupPoint.hours).',
  })
  window!: TimeWindowDto | null;

  @ApiProperty({
    type: 'integer',
    example: 194_000,
    description: 'The lines’ total, in halalas, VAT included.',
  })
  subtotalHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 0,
    description:
      'The coupon discount, in halalas; 0 for none. Never applied to the delivery fee.',
  })
  discountHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 2500,
    description: 'The delivery fee, in halalas; 0 for pickup.',
  })
  deliveryFeeHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 25630,
    description:
      'The VAT inside totalHalalas: round half up of total × 15 / 115.',
  })
  vatHalalas!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'EID15',
    description: 'The coupon applied, upper case; null for none.',
  })
  couponCode!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'The customer’s note on the order; null for none.',
  })
  notes!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description:
      'Why it was cancelled; for a rejected COD order this is the vendor’s or admin’s required transition note. Null otherwise.',
  })
  cancelReason!: string | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2026-11-22T10:15:00.000Z',
    description:
      'Reserved for the payment-expiry task; null in the COD-only API while that task is deferred.',
  })
  expiresAt!: Date | null;

  @ApiProperty({
    type: OrderPaymentSummaryResponseDto,
    description: 'How it is paid.',
  })
  payment!: OrderPaymentSummaryResponseDto;

  @ApiProperty({
    type: [OrderRefundResponseDto],
    description: 'Refunds made; empty for none (Sprint 4).',
  })
  refunds!: OrderRefundResponseDto[];

  @ApiProperty({
    type: [OrderHistoryEntryResponseDto],
    description: 'Every move of the order, oldest first.',
  })
  history!: OrderHistoryEntryResponseDto[];

  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    isArray: true,
    example: ['confirmed', 'cancelled'],
    description:
      'The statuses this caller may move it to now with POST …/orders/{id}/transition, from the order state machine; empty for none. Customers cannot move order statuses in Sprint 3.',
  })
  allowedTransitions!: (typeof ORDER_STATUSES)[number][];
}
