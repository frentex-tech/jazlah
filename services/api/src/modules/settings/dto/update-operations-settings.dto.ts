import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { ClosedDayDto } from './closed-day.dto';
import { CodSettingsDto } from './cod-settings.dto';
import { CutoffsDto } from './cutoffs.dto';
import { DefaultCapacityDto } from './default-capacity.dto';

/** A change to the operations settings: only the keys sent change; the pause has its own route. */
export class UpdateOperationsSettingsDto {
  @ApiPropertyOptional({
    type: TimeWindowDto,
    description:
      'The delivery window every delivery day uses, Riyadh time. Left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeWindowDto)
  deliveryWindow?: TimeWindowDto;

  @ApiPropertyOptional({
    type: CutoffsDto,
    description:
      'The cut-off and lead days of each kind of order. Left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CutoffsDto)
  cutoffs?: CutoffsDto;

  @ApiPropertyOptional({
    type: DefaultCapacityDto,
    description:
      'Each vendor’s daily capacity unless it has its own (PUT /v1/admin/vendors/{id}/capacity). Left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultCapacityDto)
  defaultCapacity?: DefaultCapacityDto;

  @ApiPropertyOptional({
    type: CodSettingsDto,
    description: 'Cash on delivery. Left out: unchanged.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodSettingsDto)
  cod?: CodSettingsDto;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 60,
    example: 14,
    description:
      'How many days ahead can be booked, counting today: 14 offers today to today + 13. 1 to 60. Left out: unchanged.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  bookingHorizonDays?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    maximum: 10_000_000,
    example: 10000,
    description:
      'The smallest order, in halalas (VAT included), compared with the subtotal before any discount. 0 to 10000000. Left out: unchanged.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  minOrderHalalas?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    maximum: 1_000_000,
    example: 2500,
    description:
      'The delivery fee, in halalas (VAT included), added to delivery orders only and never discounted. 0 to 1000000. Left out: unchanged.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  deliveryFeeHalalas?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 720,
    example: 48,
    description:
      'How long after delivery a complaint can be opened (complaints: Sprint 5). 1 to 720. Left out: unchanged.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  complaintWindowHours?: number;

  @ApiPropertyOptional({
    type: [ClosedDayDto],
    maxItems: 366,
    description:
      'The whole list of closed days, at most 366, each date once; replaces the saved list. Left out: unchanged.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(366)
  @ValidateNested({ each: true })
  @Type(() => ClosedDayDto)
  closedDays?: ClosedDayDto[];
}
