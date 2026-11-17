import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/** The customer's marketing choice. */
export class SetMarketingConsentDto {
  @ApiProperty({
    description: 'True grants marketing messages, false withdraws the consent.',
    example: true,
  })
  @IsBoolean()
  granted!: boolean;
}
