import { ApiProperty } from '@nestjs/swagger';

/** A new pair of tokens: from a refresh, and (with the principal) from a sign-in. */
export class AuthTokensResponseDto {
  @ApiProperty({
    description:
      'The access token (a JWT; treat it as opaque), sent as `Authorization: Bearer <token>` on every request of its one audience. Signing out does not revoke it: it works until it expires.',
    example:
      'eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3ZjNhMmMxZS0wYjlkLTRlNWYtOGE2Yi0xYzJkM2U0ZjVhNmIiLCJhdWQiOiJjdXN0b21lciJ9.Qm9ndXMtc2lnbmF0dXJlLWZvci1kb2Nz',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'How long the access token lives from now, in seconds (900, 15 minutes, by default; between 60 and 3600). Refresh when it runs out or on 401 ACCESS_TOKEN_EXPIRED.',
    example: 900,
    minimum: 60,
    maximum: 3600,
  })
  accessTokenExpiresInSeconds!: number;

  @ApiProperty({
    description:
      'The refresh token: 43 URL-safe characters, exchanged once for a new pair (`POST /v1/public/auth/refresh`) and used to sign out (`POST /v1/public/auth/logout`). Keep it in secure storage (Keychain, Keystore) and replace it with each new one.',
    example: 'ptTZDMCWDqkGo3v_YTevDvyYYKE9TwqoKSw2sesJl1A',
  })
  refreshToken!: string;

  @ApiProperty({
    description:
      'How long the refresh token lives from now, in seconds (2592000, 30 days, by default; between 86400 and 7776000). Unused for that long, the user signs in again.',
    example: 2592000,
    minimum: 86400,
    maximum: 7776000,
  })
  refreshTokenExpiresInSeconds!: number;
}
