import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { GetCurrentUserUseCase } from '../../application/get-current-user.use-case';
import { LogoutAllUseCase } from '../../application/logout-all.use-case';
import { PrincipalResponseDto } from '../dto/principal-response.dto';
import { toPrincipalResponse } from '../to-principal-response';

/** The session endpoints of vendor staff: who is signed in, and signing out everywhere. */
@ApiTags('auth')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor')
export class VendorAuthController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly logoutEverywhere: LogoutAllUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Who is signed in' })
  @ApiOkResponse({ type: PrincipalResponseDto })
  @ApiErrorResponses(
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.RATE_LIMITED,
  )
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PrincipalResponseDto> {
    return toPrincipalResponse(await this.getCurrentUser.execute(user));
  }

  @Post('auth/logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Sign out of every vendor session of this user',
    description:
      'Ends this session too. Access tokens already issued keep working until they expire.',
  })
  @ApiNoContentResponse({ description: 'Signed out everywhere.' })
  @ApiErrorResponses(
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.RATE_LIMITED,
  )
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logoutEverywhere.execute(user);
  }
}
