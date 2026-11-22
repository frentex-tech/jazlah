import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsISO8601,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { COUPON_TYPES } from '../coupon-types.constants';

/** A new coupon. */
export class CreateCouponDto {
  @ApiProperty({
    example: 'EID15',
    description:
      'The code customers type, 3 to 32 letters, digits, `_` or `-`; stored upper case, unique in any case (COUPON_CODE_TAKEN).',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{3,32}$/, { message: 'isCouponCode' })
  code!: string;

  @ApiProperty({
    enum: COUPON_TYPES,
    example: 'percent',
    description: '`percent` or `fixed`.',
  })
  @IsIn(COUPON_TYPES)
  type!: (typeof COUPON_TYPES)[number];

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 10_000_000,
    example: 15,
    description:
      'percent: 1 to 100 (VALIDATION_FAILED `percent` above); fixed: halalas, 1 to 10000000.',
  })
  @IsInt()
  @Min(1)
  @Max(10_000_000)
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
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
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
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  minOrderHalalas!: number | null;

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    description: 'The stores it is for, at most 200; empty: every store.',
  })
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  vendorIds!: string[];

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e'],
    description:
      'The categories whose lines it discounts, at most 200; empty: every line.',
  })
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  categoryIds!: string[];

  @ApiProperty({
    example: '2026-12-01T00:00:00+03:00',
    description:
      'When it starts: an ISO 8601 date and time with `Z` or an offset (VALIDATION_FAILED `isInstant` otherwise).',
  })
  @IsISO8601({ strict: true })
  @Matches(/T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'isInstant',
  })
  startsAt!: string;

  @ApiProperty({
    example: '2026-12-10T00:00:00+03:00',
    description:
      'When it ends, after startsAt (VALIDATION_FAILED `endBeforeStart` otherwise); with `Z` or an offset.',
  })
  @IsISO8601({ strict: true })
  @Matches(/T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'isInstant',
  })
  endsAt!: string;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 500,
    description: 'How many orders in all may use it; null: no limit.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  usageLimit!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 1000,
    example: 1,
    description: 'How many orders of one customer may use it; null: no limit.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(1000)
  perUserLimit!: number | null;

  @ApiProperty({
    example: true,
    description: 'Switched on; false: no one can use it.',
  })
  @IsBoolean()
  isActive!: boolean;
}
