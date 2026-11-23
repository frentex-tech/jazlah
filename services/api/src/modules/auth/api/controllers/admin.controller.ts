import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { GetCurrentUserUseCase } from '../../application/get-current-user.use-case';
import { LogoutAllUseCase } from '../../application/logout-all.use-case';
import { PrincipalResponseDto } from '../dto/principal-response.dto';
import { toPrincipalResponse } from '../to-principal-response';

/** The session endpoints of an admin: who is signed in, and signing out everywhere. */
@ApiTags(API_TAGS.adminAccount.name)
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly logoutEverywhere: LogoutAllUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    operationId: 'adminGetMe',
    summary: 'Who is signed in',
    description:
      'Admin dashboard, at start-up and in the account menu: the signed-in user of this session, with the phone number masked. `organisationId` is null for admins.\n\n' +
      'Errors:\n' +
      '- UNAUTHORIZED (401): also when the user no longer exists; go to the sign-in screen.\n' +
      '- ACCOUNT_DISABLED (403): the account is disabled; show the support message.',
  })
  @ApiOkResponse({
    type: PrincipalResponseDto,
    description: 'The signed-in user of this session.',
  })
  @ApiErrorResponses(
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PrincipalResponseDto> {
    return toPrincipalResponse(await this.getCurrentUser.execute(user));
  }

  @Post('auth/logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'adminLogoutAll',
    summary: 'Sign out of every admin session of this user',
    description:
      'Admin dashboard, account menu ("Sign out of all devices"): ends every admin session of the user, this one included, so every refresh token stops working; delete the tokens from this device afterwards. Sessions of the same person in other apps are not touched. Access tokens already issued keep working until they expire (15 minutes by default).',
  })
  @ApiNoContentResponse({
    description: 'Every admin session of the user has ended.',
  })
  @ApiErrorResponses(ErrorCode.SERVICE_UNAVAILABLE, ...ADMIN_AUTH_ERRORS)
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logoutEverywhere.execute(user);
  }
}
