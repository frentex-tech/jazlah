import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/** The payment provider sending the event. */
export class PaymentProviderParamDto {
  @ApiProperty({
    example: 'fake',
    description:
      'The provider’s name in our configuration, lower case (`fake` on staging).',
  })
  @IsString()
  @Matches(/^[a-z][a-z0-9-]{1,30}$/, { message: 'isProviderName' })
  provider!: string;
}
