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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
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
 *
 * Every operation reads the database (SERVICE_UNAVAILABLE when it is unreachable) and
 * checks the user (ACCOUNT_DISABLED); every write runs in a transaction that locks the
 * user's row first (TRANSACTION_CONFLICT when a write conflict outlasts the retries).
 * Two tags, given on each method: the profile and the consent under
 * API_TAGS.customerProfile, the addresses under API_TAGS.customerAddresses.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerCustomersController {
  constructor(
    private readonly profiles: CustomerProfilesService,
    private readonly consents: MarketingConsentsService,
    private readonly addresses: CustomerAddressesService,
  ) {}

  @Patch('profile')
  @ApiTags(API_TAGS.customerProfile.name)
  @ApiOperation({
    operationId: 'customerUpdateProfile',
    summary: 'Update my profile',
    description:
      'Customer app, the profile screen (and the name step after the first sign-in). Saves the fields sent at once; a field left out keeps its value. ' +
      'fullName and preferredLanguage can be changed but not removed (null is VALIDATION_FAILED); email null or blank removes it. ' +
      'The profile is complete once it has a full name: the app can be used without one, but placing an order will require it. ' +
      'Returns the whole profile; read it later with GET /v1/customer/me. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiOkResponse({
    type: CustomerProfileResponseDto,
    description: 'The whole profile, as saved.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerProfile.name)
  @ApiOperation({
    operationId: 'customerSetMarketingConsent',
    summary: 'Grant or withdraw my marketing consent',
    description:
      'Customer app, the marketing messages switch (settings, or the consent step after sign-up). Marketing is opt-in: until the customer grants it, the consent is not granted. ' +
      'Applied at once. Each change is recorded and kept, so the consent can be proven later; sending the current choice again records nothing and returns it unchanged (safe to repeat). ' +
      'The current consent is also part of GET /v1/customer/me. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiOkResponse({
    type: MarketingConsentResponseDto,
    description: 'The current consent, after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerListAddresses',
    summary: 'My saved addresses',
    description:
      `Customer app, the address book and the delivery address picker at checkout. Returns every address of the customer (at most ${CUSTOMER_LIMITS.addresses}): the default first, then newest first. ` +
      'Not paged (no cursor, no limit): the list is short by rule. An empty list means none is saved yet. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out.',
  })
  @ApiOkResponse({
    type: CustomerAddressListResponseDto,
    description: 'Every saved address, the default first.',
  })
  @ApiErrorResponses(
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async listAddresses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerAddressListResponseDto> {
    const addresses = await this.addresses.list(user.userId);
    return { items: addresses.map(toCustomerAddressResponse) };
  }

  @Post('addresses')
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerCreateAddress',
    summary: 'Save an address',
    description:
      'Customer app, "add address": the customer picks a point on the map, the app fills the readable fields from it (reverse geocoding) and the customer may edit them. Saved at once. ' +
      'label and location are required; the readable fields are optional, and blank or null is saved as null. ' +
      `The first address becomes the default; isDefault true makes a later one the default instead of the current one. At most ${CUSTOMER_LIMITS.addresses} addresses per customer. ` +
      'Whether the point is inside a delivery area is not checked here. ' +
      `ADDRESS_LIMIT_REACHED: the customer already has ${CUSTOMER_LIMITS.addresses} (details.limit); nothing was saved, ask them to delete one first. ` +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiCreatedResponse({
    type: CustomerAddressResponseDto,
    description: 'The saved address, with its id.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ADDRESS_LIMIT_REACHED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerGetAddress',
    summary: 'One of my saved addresses',
    description:
      'Customer app, the edit address screen. Returns one saved address of the signed-in customer. ' +
      'VALIDATION_FAILED: the id is not a UUID. ' +
      'NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out.',
  })
  @ApiOkResponse({
    type: CustomerAddressResponseDto,
    description: 'The address.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerUpdateAddress',
    summary: 'Change a saved address',
    description:
      'Customer app, the edit address screen. Saves the fields sent at once; a field left out keeps its value. ' +
      'For the readable fields (city, district, street, building, shortNationalAddress, driverInstructions), null or blank clears the field. ' +
      'label and location can be changed but not removed (null is VALIDATION_FAILED). ' +
      'Whether the address is the default does not change here: use POST /v1/customer/addresses/{id}/default. ' +
      'Orders keep the address snapshot as it was at checkout. While a non-final order uses this address, `isLocked` is true and changes are refused with ADDRESS_IN_USE. ' +
      'NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiOkResponse({
    type: CustomerAddressResponseDto,
    description: 'The address after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ADDRESS_IN_USE,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerSetDefaultAddress',
    summary: 'Make an address my default',
    description:
      'Customer app, the address book ("set as default"). No request body. Applied at once: this address becomes the default and the old default stops being one, so exactly one address is the default. ' +
      'Sent for the address that is already the default, it changes nothing (safe to repeat). ' +
      'NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiOkResponse({
    type: CustomerAddressResponseDto,
    description: 'The address, now the default.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.customerAddresses.name)
  @ApiOperation({
    operationId: 'customerDeleteAddress',
    summary: 'Delete a saved address',
    description:
      'Customer app, the address book. Deletes the address at once and for good. ' +
      'When it was the default, the newest remaining address becomes the default (reload the list to show it); deleting the last one leaves none. ' +
      'Orders keep the address snapshot as it was at checkout. While a non-final order uses this address, `isLocked` is true and deletion is refused with ADDRESS_IN_USE. ' +
      'NOT_FOUND: no such address, or it belongs to another customer; also when it was already deleted (a repeated request, or another device), so treat it as gone and reload the list. ' +
      'ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. ' +
      'UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. ' +
      'TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.',
  })
  @ApiNoContentResponse({
    description: 'Deleted. No body.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ADDRESS_IN_USE,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<void> {
    await this.addresses.remove(user.userId, params.id);
  }
}
