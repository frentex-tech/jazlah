import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

/** The cut-off of one kind of order: the earliest day is today plus `leadDays`, one day later once the cut-off time has passed (Riyadh time). */
export class CutoffRuleDto {
  @ApiProperty({
    type: String,
    nullable: true,
    example: '20:00',
    description:
      'The daily cut-off, Riyadh time `HH:mm`; null: no cut-off time, only the lead days count.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'isTimeOfDay' })
  time!: string | null;

  @ApiProperty({
    type: 'integer',
    minimum: 0,
    maximum: 30,
    example: 1,
    description:
      'Whole days between ordering and the first possible day, 0 to 30.',
  })
  @IsInt()
  @Min(0)
  @Max(30)
  leadDays!: number;
}
