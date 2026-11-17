import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
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
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { DeleteCustomerAccountUseCase } from '../../application/delete-customer-account.use-case';
import { GetCustomerMeUseCase } from '../../application/get-customer-me.use-case';
import { LogoutAllUseCase } from '../../application/logout-all.use-case';
import { CustomerMeResponseDto } from '../dto/customer-me-response.dto';
import { DeleteAccountQueryDto } from '../dto/delete-account-query.dto';
import { toCustomerMeResponse } from '../to-customer-me-response';

/**
 * The account endpoints of a customer: who is signed in (with the profile), signing out
 * everywhere, and deleting the account.
 */
@ApiTags('auth')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerAuthController {
  constructor(
    private readonly getCustomerMe: GetCustomerMeUseCase,
    private readonly logoutEverywhere: LogoutAllUseCase,
    private readonly deleteAccount: DeleteCustomerAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Who is signed in, with my profile',
    description:
      'The phone is in full here, and only here. profileComplete false: the app may show the profile completion screen.',
  })
  @ApiOkResponse({ type: CustomerMeResponseDto })
  @ApiErrorResponses(ErrorCode.ACCOUNT_DISABLED, ...CUSTOMER_AUTH_ERRORS)
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerMeResponseDto> {
    return toCustomerMeResponse(await this.getCustomerMe.execute(user));
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete my account',
    description:
      'At once and for good: every session ends, the profile, addresses and vendor applications are removed, and the phone can sign up again as a new user. Needs a sign-in within the last 10 minutes (RECENT_SIGN_IN_REQUIRED: sign in again). Refused while the account has vendor, kitchen or admin access (ACCOUNT_HAS_STAFF_ACCESS), and for a disabled account (ACCOUNT_DISABLED: contact support).',
  })
  @ApiNoContentResponse({ description: 'The account is deleted.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RECENT_SIGN_IN_REQUIRED,
    ErrorCode.ACCOUNT_HAS_STAFF_ACCESS,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DeleteAccountQueryDto,
  ): Promise<void> {
    await this.deleteAccount.execute({
      principal: user,
      reason: query.reason ?? null,
    });
  }

  @Post('auth/logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Sign out of every customer session of this user',
    description:
      'Ends this session too. Access tokens already issued keep working until they expire.',
  })
  @ApiNoContentResponse({ description: 'Signed out everywhere.' })
  @ApiErrorResponses(...CUSTOMER_AUTH_ERRORS)
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logoutEverywhere.execute(user);
  }
}
