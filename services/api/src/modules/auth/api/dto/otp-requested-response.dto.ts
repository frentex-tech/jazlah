import { ApiProperty } from '@nestjs/swagger';

export class OtpRequestedResponseDto {
  @ApiProperty({
    description: 'How long the code can be used, in seconds.',
    example: 300,
  })
  expiresInSeconds!: number;

  @ApiProperty({
    description: 'How long to wait before asking for another code, in seconds.',
    example: 60,
  })
  resendAfterSeconds!: number;
}
