import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({
    description: 'Sent as `Authorization: Bearer <token>` on every request.',
    example: 'eyJhbGciOi…',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'How long the access token lives, in seconds.',
    example: 900,
  })
  accessTokenExpiresInSeconds!: number;

  @ApiProperty({
    description:
      'Exchanged once for a new pair when the access token expires. Keep it in secure storage.',
    example: 'q3vX…',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'How long the refresh token lives, in seconds.',
    example: 2592000,
  })
  refreshTokenExpiresInSeconds!: number;
}
