import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/** The customer's marketing choice. */
export class SetMarketingConsentDto {
  @ApiProperty({
    description:
      'true grants marketing messages, false withdraws the consent. Required, as a JSON boolean (null, `"true"` or `1` is VALIDATION_FAILED).',
    example: true,
  })
  @IsBoolean()
  granted!: boolean;
}
