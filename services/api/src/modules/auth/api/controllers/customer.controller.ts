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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
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
@ApiTags(API_TAGS.customerAccount.name)
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
    operationId: 'customerGetMe',
    summary: 'Who is signed in, with my profile',
    description:
      'Customer app, at start-up and on the account screen: the signed-in customer, their own phone number in full (the only response that shows it unmasked), the profile and the marketing consent. `profileComplete` false: the app may show the profile completion screen.\n\n' +
      'Errors:\n' +
      '- UNAUTHORIZED (401): also when the account has been deleted since the token was issued; go to the sign-in screen.\n' +
      '- ACCOUNT_DISABLED (403): the account is disabled; show the support message.',
  })
  @ApiOkResponse({
    type: CustomerMeResponseDto,
    description: 'The signed-in customer with their profile.',
  })
  @ApiErrorResponses(
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerMeResponseDto> {
    return toCustomerMeResponse(await this.getCustomerMe.execute(user));
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'customerDeleteAccount',
    summary: 'Delete my account',
    description:
      'Customer app, account screen ("Delete my account"), after the customer confirms. At once and for good: every session of the user ends (in every app), the profile, addresses and vendor applications not yet approved are removed, and the phone can sign up again as a new user. Afterwards delete the tokens from the device and go to the sign-in screen. The optional `reason` comes from a fixed list the app shows.\n\n' +
      'Errors:\n' +
      '- RECENT_SIGN_IN_REQUIRED (403): the session was signed in more than 10 minutes ago. Sign the customer in again (code by SMS), then repeat the request.\n' +
      '- ACCOUNT_HAS_STAFF_ACCESS (409): the account also has vendor, kitchen or admin access; it cannot be deleted in the app until that access is removed.\n' +
      '- ACCOUNT_DISABLED (403): the account is disabled; deletion goes through support.\n' +
      '- UNAUTHORIZED (401): also when the account is already deleted.\n' +
      '- TRANSACTION_CONFLICT (409): a rare clash with another change to the same account; nothing was deleted, send the same request again.',
  })
  @ApiNoContentResponse({
    description: 'The account is deleted and every session has ended.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RECENT_SIGN_IN_REQUIRED,
    ErrorCode.ACCOUNT_HAS_STAFF_ACCESS,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'customerLogoutAll',
    summary: 'Sign out of every customer session of this user',
    description:
      'Customer app, account or security screen ("Sign out of all devices"): ends every customer session of the user, this one included, so every refresh token stops working; delete the tokens from this device afterwards. Sessions of the same person in the vendor, kitchen or admin dashboards are not touched. Access tokens already issued keep working until they expire (15 minutes by default).',
  })
  @ApiNoContentResponse({
    description: 'Every customer session of the user has ended.',
  })
  @ApiErrorResponses(ErrorCode.SERVICE_UNAVAILABLE, ...CUSTOMER_AUTH_ERRORS)
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logoutEverywhere.execute(user);
  }
}
