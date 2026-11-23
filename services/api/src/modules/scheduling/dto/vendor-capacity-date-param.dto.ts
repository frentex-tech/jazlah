import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, IsUUID, Matches } from 'class-validator';

/** A vendor and one of its days. */
export class VendorCapacityDateParamDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The vendor (UUID).',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    example: '2026-11-24',
    description:
      'The day, Riyadh calendar `yyyy-MM-dd`; a past day is VALIDATION_FAILED `notPast` when setting it.',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'isCalendarDate' })
  @IsISO8601({ strict: true })
  date!: string;
}
