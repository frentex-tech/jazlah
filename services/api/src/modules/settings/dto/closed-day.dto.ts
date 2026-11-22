import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsISO8601, IsIn, IsString, Length, Matches } from 'class-validator';
import { trimText } from '@common/dto/trim-text';
import { CLOSED_DAY_SCOPES } from '../closed-day-scopes.constants';

/** A day the platform takes no orders for (a holiday), for both methods or one. */
export class ClosedDayDto {
  @ApiProperty({
    example: '2026-12-02',
    description:
      'The day, Riyadh calendar `yyyy-MM-dd`. A day added in the past is VALIDATION_FAILED `notPast`; past days already saved are kept as history.',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'isCalendarDate' })
  @IsISO8601({ strict: true })
  date!: string;

  @ApiProperty({
    enum: CLOSED_DAY_SCOPES,
    example: 'both',
    description: 'What it closes: `both`, `delivery` or `pickup`.',
  })
  @IsIn(CLOSED_DAY_SCOPES)
  scope!: (typeof CLOSED_DAY_SCOPES)[number];

  @ApiProperty({
    example: 'إجازة اليوم الوطني',
    description:
      'Why, in Arabic, shown to the customer beside the day; 1 to 100 characters.',
  })
  @Transform(trimText)
  @IsString()
  @Length(1, 100)
  reasonAr!: string;

  @ApiProperty({
    example: 'National Day holiday',
    description: 'Why, in English; 1 to 100 characters.',
  })
  @Transform(trimText)
  @IsString()
  @Length(1, 100)
  reasonEn!: string;
}
