import { ApiProperty } from '@nestjs/swagger';

/** The answer to a code request: how long the code lives and when to offer a resend. */
export class OtpRequestedResponseDto {
  @ApiProperty({
    description:
      'How long the code can be used from now, in seconds (300 by default; between 60 and 900). After that, verifying answers OTP_EXPIRED.',
    example: 300,
    minimum: 60,
    maximum: 900,
  })
  expiresInSeconds!: number;

  @ApiProperty({
    description:
      'How long to wait before offering "Resend code", in seconds (60 by default; between 1 and 600). Asking earlier answers RATE_LIMITED.',
    example: 60,
    minimum: 1,
    maximum: 600,
  })
  resendAfterSeconds!: number;
}
