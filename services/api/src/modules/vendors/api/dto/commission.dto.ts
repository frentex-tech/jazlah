import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { COMMISSION_BASIS_POINTS } from '../../domain/commission-basis-points.constants';

/** A commission for future orders, in basis points: approving an application, or changing it. */
export class CommissionDto {
  @ApiProperty({
    minimum: COMMISSION_BASIS_POINTS.min,
    maximum: COMMISSION_BASIS_POINTS.max,
    description:
      'The platform commission on future orders, in basis points: a whole number from 0 (0%) to 10000 (100%); 1250 is 12.5%. A fraction (12.5) is VALIDATION_FAILED.',
    example: 1250,
  })
  @IsInt()
  @Min(COMMISSION_BASIS_POINTS.min)
  @Max(COMMISSION_BASIS_POINTS.max)
  commissionBasisPoints!: number;
}
