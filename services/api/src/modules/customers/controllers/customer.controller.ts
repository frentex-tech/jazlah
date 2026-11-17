import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CustomerAddressesService } from '../customer-addresses.service';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { CustomerProfilesService } from '../customer-profiles.service';
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';
import { CustomerAddressListResponseDto } from '../dto/customer-address-list-response.dto';
import { CustomerAddressResponseDto } from '../dto/customer-address-response.dto';
import { CustomerProfileResponseDto } from '../dto/customer-profile-response.dto';
import { MarketingConsentResponseDto } from '../dto/marketing-consent-response.dto';
import { SetMarketingConsentDto } from '../dto/set-marketing-consent.dto';
import { UpdateCustomerAddressDto } from '../dto/update-customer-address.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { MarketingConsentsService } from '../marketing-consents.service';
import { toCustomerAddressResponse } from '../to-customer-address-response';
import { toCustomerProfileResponse } from '../to-customer-profile-response';
import { toMarketingConsentResponse } from '../to-marketing-consent-response';

/**
 * The signed-in customer's profile, marketing consent and saved addresses. Reading the
 * profile is `GET /v1/customer/me` (auth module); deleting the account is
 * `DELETE /v1/customer/me`.
 */
@ApiTags('customers')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerCustomersController {
  constructor(
    private readonly profiles: CustomerProfilesService,
    private readonly consents: MarketingConsentsService,
    private readonly addresses: CustomerAddressesService,
  ) {}

  @Patch('profile')
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Saves the fields sent; the profile is complete once it has a full name (FR-ACC-02).',
  })
  @ApiOkResponse({ type: CustomerProfileResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    return toCustomerProfileResponse(
      await this.profiles.update(user.userId, {
        fullName: body.fullName,
        email: body.email,
        preferredLanguage: body.preferredLanguage,
      }),
    );
  }

  @Put('profile/marketing-consent')
  @ApiOperation({
    summary: 'Grant or withdraw my marketing consent',
    description:
      'Each change is recorded and kept, so the consent can be proven later; sending the current choice again records nothing.',
  })
  @ApiOkResponse({ type: MarketingConsentResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async setMarketingConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetMarketingConsentDto,
  ): Promise<MarketingConsentResponseDto> {
    return toMarketingConsentResponse(
      await this.consents.set(user.userId, body.granted),
    );
  }

  @Get('addresses')
  @ApiOperation({
    summary: 'My saved addresses',
    description: `All of them (at most ${CUSTOMER_LIMITS.addresses}), the default first, then newest first. Not paged.`,
  })
  @ApiOkResponse({ type: CustomerAddressListResponseDto })
  @ApiErrorResponses(ErrorCode.ACCOUNT_DISABLED, ...CUSTOMER_AUTH_ERRORS)
  async listAddresses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerAddressListResponseDto> {
    const addresses = await this.addresses.list(user.userId);
    return { items: addresses.map(toCustomerAddressResponse) };
  }

  @Post('addresses')
  @ApiOperation({
    summary: 'Save an address',
    description: `At most ${CUSTOMER_LIMITS.addresses} (ADDRESS_LIMIT_REACHED). The first address becomes the default; isDefault makes a later one the default.`,
  })
  @ApiCreatedResponse({ type: CustomerAddressResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ADDRESS_LIMIT_REACHED,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCustomerAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return toCustomerAddressResponse(
      await this.addresses.create(user.userId, {
        label: body.label,
        location: {
          latitude: body.location.latitude,
          longitude: body.location.longitude,
        },
        city: body.city ?? null,
        district: body.district ?? null,
        street: body.street ?? null,
        building: body.building ?? null,
        shortNationalAddress: body.shortNationalAddress ?? null,
        driverInstructions: body.driverInstructions ?? null,
        makeDefault: body.isDefault ?? false,
      }),
    );
  }

  @Get('addresses/:id')
  @ApiOperation({ summary: 'One of my saved addresses' })
  @ApiOkResponse({ type: CustomerAddressResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async getAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<CustomerAddressResponseDto> {
    return toCustomerAddressResponse(
      await this.addresses.get(user.userId, params.id),
    );
  }

  @Patch('addresses/:id')
  @ApiOperation({
    summary: 'Change a saved address',
    description:
      'Saves the fields sent; null clears a readable field. The default changes through POST …/default.',
  })
  @ApiOkResponse({ type: CustomerAddressResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: UpdateCustomerAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return toCustomerAddressResponse(
      await this.addresses.update(user.userId, params.id, {
        label: body.label,
        location:
          body.location === undefined
            ? undefined
            : {
                latitude: body.location.latitude,
                longitude: body.location.longitude,
              },
        city: body.city,
        district: body.district,
        street: body.street,
        building: body.building,
        shortNationalAddress: body.shortNationalAddress,
        driverInstructions: body.driverInstructions,
      }),
    );
  }

  @Post('addresses/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Make an address my default',
    description: 'The old default stops being the default.',
  })
  @ApiOkResponse({ type: CustomerAddressResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async makeDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<CustomerAddressResponseDto> {
    return toCustomerAddressResponse(
      await this.addresses.makeDefault(user.userId, params.id),
    );
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a saved address',
    description:
      'When it was the default, the newest remaining address becomes the default.',
  })
  @ApiNoContentResponse({ description: 'Deleted.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<void> {
    await this.addresses.remove(user.userId, params.id);
  }
}
