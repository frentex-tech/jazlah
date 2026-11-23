import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { Audience } from '@common/auth/audience.type';
import { AUDIENCES } from '@common/auth/audiences.constants';
import { SaudiMobileNumber } from '@common/phone/saudi-mobile-number.decorator';

/** The body of a code request: the phone and the app the user signs in to. */
export class RequestOtpDto {
  @ApiProperty({
    description:
      'A Saudi mobile number, in any usual form (05…, 5…, 9665…, +9665…), with Latin or Arabic digits; the API stores it as +9665 and 8 digits. Anything else is VALIDATION_FAILED.',
    example: '0512345678',
  })
  @SaudiMobileNumber()
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description:
      'The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.',
    example: 'customer',
  })
  @IsIn(AUDIENCES)
  audience!: Audience;
}
