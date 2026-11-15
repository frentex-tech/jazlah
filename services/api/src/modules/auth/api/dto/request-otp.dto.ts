import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { Audience } from '@common/auth/audience.type';
import { AUDIENCES } from '@common/auth/audiences.constants';
import { SaudiMobileNumber } from '@common/phone/saudi-mobile-number.decorator';

export class RequestOtpDto {
  @ApiProperty({
    description:
      'A Saudi mobile number, in any usual form (05…, 5…, 9665…, +9665…), with Latin or Arabic digits.',
    example: '0512345678',
  })
  @SaudiMobileNumber()
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description: 'The application the user is signing in to.',
    example: 'customer',
  })
  @IsIn(AUDIENCES)
  audience!: Audience;
}
