import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** The body of refresh and of logout: the refresh token of the session. */
export class RefreshTokenDto {
  @ApiProperty({
    description:
      'The refresh token of the session, as the last sign-in or refresh returned it (43 URL-safe characters). Accepted from 20 to 200 characters; a token the API does not know is not a validation error.',
    example: 'ptTZDMCWDqkGo3v_YTevDvyYYKE9TwqoKSw2sesJl1A',
    minLength: 20,
    maxLength: 200,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  refreshToken!: string;
}
