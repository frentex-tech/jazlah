import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/** Whether a product can be ordered now. */
export class SetProductAvailabilityDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isAvailable!: boolean;
}
