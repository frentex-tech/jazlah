import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** The body of refresh and of logout: the refresh token of the session. */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token of the session.',
    example: 'q3vX…',
    minLength: 20,
    maxLength: 200,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  refreshToken!: string;
}
