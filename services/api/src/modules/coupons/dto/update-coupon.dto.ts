import { ApiPropertyOptional } from '@nestjs/swagger';
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

/** A change to a coupon: only the fields sent change (`{ isActive: false }` switches it off). */
export class UpdateCouponDto {
  @ApiPropertyOptional({
    example: 'EID15',
    description:
      'The code customers type, 3 to 32 letters, digits, `_` or `-`; stored upper case, unique in any case (COUPON_CODE_TAKEN). Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{3,32}$/, { message: 'isCouponCode' })
  code?: string;

  @ApiPropertyOptional({
    enum: COUPON_TYPES,
    example: 'percent',
    description:
      '`percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsIn(COUPON_TYPES)
  type?: (typeof COUPON_TYPES)[number];

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 10_000_000,
    example: 15,
    description:
      'percent: 1 to 100 (VALIDATION_FAILED `percent` above); fixed: halalas, 1 to 10000000. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  value?: number;

  @ApiPropertyOptional({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 5000,
    description:
      'The most a percent coupon takes off, in halalas; null: no cap (send null for fixed). Left out: unchanged.',
  })
  @ValidateIf((_dto, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  maxDiscountHalalas?: number | null;

  @ApiPropertyOptional({
    type: 'integer',
    nullable: true,
    minimum: 0,
    maximum: 10_000_000,
    example: 20000,
    description:
      'The smallest subtotal of the whole cart before discounts it applies to; null: none. Left out: unchanged.',
  })
  @ValidateIf((_dto, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  minOrderHalalas?: number | null;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    description:
      'The stores it is for, at most 200; empty: every store. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  vendorIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    example: ['2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e'],
    description:
      'The categories whose lines it discounts, at most 200; empty: every line. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    example: '2026-12-01T00:00:00+03:00',
    description:
      'When it starts: an ISO 8601 date and time with `Z` or an offset (VALIDATION_FAILED `isInstant` otherwise). Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsISO8601({ strict: true })
  @Matches(/T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'isInstant',
  })
  startsAt?: string;

  @ApiPropertyOptional({
    example: '2026-12-10T00:00:00+03:00',
    description:
      'When it ends, after startsAt (VALIDATION_FAILED `endBeforeStart` otherwise); with `Z` or an offset. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsISO8601({ strict: true })
  @Matches(/T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'isInstant',
  })
  endsAt?: string;

  @ApiPropertyOptional({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 500,
    description:
      'How many orders in all may use it; null: no limit. Left out: unchanged.',
  })
  @ValidateIf((_dto, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  usageLimit?: number | null;

  @ApiPropertyOptional({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 1000,
    example: 1,
    description:
      'How many orders of one customer may use it; null: no limit. Left out: unchanged.',
  })
  @ValidateIf((_dto, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  @Max(1000)
  perUserLimit?: number | null;

  @ApiPropertyOptional({
    example: true,
    description:
      'Switched on; false: no one can use it. Left out: unchanged; null: VALIDATION_FAILED.',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
