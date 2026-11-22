import { ApiProperty } from '@nestjs/swagger';
import { COUPON_STATUSES } from '../coupon-statuses.constants';
import { COUPON_TYPES } from '../coupon-types.constants';

/** A coupon and its use so far. */
export class CouponResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The coupon (UUID).',
  })
  id!: string;

  @ApiProperty({
    example: 'EID15',
    description:
      'The code customers type, 3 to 32 letters, digits, `_` or `-`; stored upper case, unique in any case (COUPON_CODE_TAKEN).',
  })
  code!: string;

  @ApiProperty({
    enum: COUPON_TYPES,
    example: 'percent',
    description: '`percent` or `fixed`.',
  })
  type!: (typeof COUPON_TYPES)[number];

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 10_000_000,
    example: 15,
    description:
      'percent: 1 to 100 (VALIDATION_FAILED `percent` above); fixed: halalas, 1 to 10000000.',
  })
  value!: number;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 5000,
    description:
      'The most a percent coupon takes off, in halalas; null: no cap (send null for fixed).',
  })
  maxDiscountHalalas!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 0,
    maximum: 10_000_000,
    example: 20000,
    description:
      'The smallest subtotal of the whole cart before discounts it applies to; null: none.',
  })
  minOrderHalalas!: number | null;

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    description: 'The stores it is for, at most 200; empty: every store.',
  })
  vendorIds!: string[];

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e'],
    description:
      'The categories whose lines it discounts, at most 200; empty: every line.',
  })
  categoryIds!: string[];

  @ApiProperty({
    example: '2026-11-30T21:00:00.000Z',
    description: 'When it starts (UTC).',
  })
  startsAt!: Date;

  @ApiProperty({
    example: '2026-12-09T21:00:00.000Z',
    description: 'When it ends (UTC).',
  })
  endsAt!: Date;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 500,
    description: 'How many orders in all may use it; null: no limit.',
  })
  usageLimit!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 1000,
    example: 1,
    description: 'How many orders of one customer may use it; null: no limit.',
  })
  perUserLimit!: number | null;

  @ApiProperty({
    example: true,
    description: 'Switched on; false: no one can use it.',
  })
  isActive!: boolean;

  @ApiProperty({
    enum: COUPON_STATUSES,
    example: 'active',
    description: 'Its state now.',
  })
  status!: (typeof COUPON_STATUSES)[number];

  @ApiProperty({
    type: 'integer',
    example: 37,
    description: 'Orders that used it (not cancelled).',
  })
  usageCount!: number;

  @ApiProperty({
    example: '2026-11-20T08:00:00.000Z',
    description: 'Created (UTC).',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-11-21T08:00:00.000Z',
    description: 'Last changed (UTC).',
  })
  updatedAt!: Date;
}
