import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/** A window of the day in Riyadh time, `HH:mm` to `HH:mm`, the end after the start. */
export class TimeWindowDto {
  @ApiProperty({
    example: '14:00',
    description: 'Start, Riyadh time, `HH:mm` (24 hours).',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'isTimeOfDay' })
  start!: string;

  @ApiProperty({
    example: '22:00',
    description:
      'End, Riyadh time, `HH:mm`, after `start` (VALIDATION_FAILED `endBeforeStart` otherwise).',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'isTimeOfDay' })
  end!: string;
}
