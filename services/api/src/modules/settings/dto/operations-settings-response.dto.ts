import { ApiProperty } from '@nestjs/swagger';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { ClosedDayDto } from './closed-day.dto';
import { CodSettingsDto } from './cod-settings.dto';
import { CutoffsDto } from './cutoffs.dto';
import { DefaultCapacityDto } from './default-capacity.dto';
import { OrderingPauseResponseDto } from './ordering-pause-response.dto';

/** The operations settings: delivery window, cut-offs, booking horizon, closed days, capacity, minimum order, delivery fee, cash on delivery and the pause. */
export class OperationsSettingsResponseDto {
  @ApiProperty({
    type: TimeWindowDto,
    description: 'The delivery window every delivery day uses, Riyadh time.',
  })
  deliveryWindow!: TimeWindowDto;

  @ApiProperty({
    type: CutoffsDto,
    description: 'The cut-off and lead days of each kind of order.',
  })
  cutoffs!: CutoffsDto;

  @ApiProperty({
    type: DefaultCapacityDto,
    description:
      'Each vendor’s daily capacity unless it has its own (PUT /v1/admin/vendors/{id}/capacity).',
  })
  defaultCapacity!: DefaultCapacityDto;

  @ApiProperty({
    type: CodSettingsDto,
    description: 'Cash on delivery.',
  })
  cod!: CodSettingsDto;

  @ApiProperty({
    type: 'integer',
    example: 14,
    description:
      'How many days ahead can be booked, counting today: 14 offers today to today + 13. 1 to 60.',
  })
  bookingHorizonDays!: number;

  @ApiProperty({
    type: 'integer',
    example: 10000,
    description:
      'The smallest order, in halalas (VAT included), compared with the subtotal before any discount. 0 to 10000000.',
  })
  minOrderHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 2500,
    description:
      'The delivery fee, in halalas (VAT included), added to delivery orders only and never discounted. 0 to 1000000.',
  })
  deliveryFeeHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 48,
    description:
      'How long after delivery a complaint can be opened (complaints: Sprint 5). 1 to 720.',
  })
  complaintWindowHours!: number;

  @ApiProperty({
    type: [ClosedDayDto],
    description: 'The closed days, past ones included, in date order.',
  })
  closedDays!: ClosedDayDto[];

  @ApiProperty({
    type: OrderingPauseResponseDto,
    description:
      'The pause; changed only with PUT /v1/admin/settings/operations/pause.',
  })
  paused!: OrderingPauseResponseDto;

  @ApiProperty({
    example: '2026-11-22T09:30:00.000Z',
    description: 'When the settings last changed (UTC).',
  })
  updatedAt!: Date;
}
