import { ApiProperty } from '@nestjs/swagger';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { DAY_UNAVAILABLE_REASONS } from '@modules/scheduling';

/** One day of the booking horizon, and whether the cart can be fulfilled on it. */
export class CheckoutDayResponseDto {
  @ApiProperty({
    example: '2026-11-24',
    description: 'The day, Riyadh calendar `yyyy-MM-dd`.',
  })
  date!: string;

  @ApiProperty({
    example: true,
    description:
      'Whether it can be chosen; `false`: shown disabled with `reason`.',
  })
  isAvailable!: boolean;

  @ApiProperty({
    enum: DAY_UNAVAILABLE_REASONS,
    nullable: true,
    example: 'FULL',
    description: 'Why not, when `isAvailable` is false; null otherwise.',
  })
  reason!: (typeof DAY_UNAVAILABLE_REASONS)[number] | null;

  @ApiProperty({
    type: TimeWindowDto,
    nullable: true,
    description:
      'The delivery window (delivery) or the store’s hours that day (pickup); null when unavailable.',
  })
  window!: TimeWindowDto | null;
}
