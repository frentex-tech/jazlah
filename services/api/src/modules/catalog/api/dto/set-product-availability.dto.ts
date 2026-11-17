import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/** Whether a product can be ordered now. */
export class SetProductAvailabilityDto {
  @ApiProperty({
    example: false,
    description:
      '`true`: can be ordered (shown in the public catalog when published); `false`: out of stock, hidden from the public catalog.',
  })
  @IsBoolean()
  isAvailable!: boolean;
}
