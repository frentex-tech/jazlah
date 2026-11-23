import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { SetVendorCapacityDto } from '../dto/set-vendor-capacity.dto';
import { SetVendorDayCapacityDto } from '../dto/set-vendor-day-capacity.dto';
import { VendorCapacityDateParamDto } from '../dto/vendor-capacity-date-param.dto';
import { VendorCapacityResponseDto } from '../dto/vendor-capacity-response.dto';

/**
 * Each vendor’s daily capacity: its own limits and one day’s limits (SCH-API-2). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminSchedulingController {
  @Get('vendors/:id/capacity')
  @ApiTags(API_TAGS.adminVendorCapacity.name)
  @ApiOperation({
    operationId: 'adminGetVendorCapacity',
    summary: 'A vendor’s capacity',
    description:
      'Admin dashboard, vendor screen, capacity tab: the vendor’s daily limits and every day of the booking horizon with its own limits and what is booked. NOT_FOUND for an unknown vendor. Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: VendorCapacityResponseDto,
    description: 'The capacity.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getVendorCapacity(
    @Param() params: IdParamDto,
  ): Promise<VendorCapacityResponseDto> {
    return notImplemented('SCH-API-2', params);
  }

  @Put('vendors/:id/capacity')
  @ApiTags(API_TAGS.adminVendorCapacity.name)
  @ApiOperation({
    operationId: 'adminSetVendorCapacity',
    summary: 'Set a vendor’s daily limits',
    description:
      'Admin dashboard, capacity tab. Applied at once to days not yet full; audited. NOT_FOUND for an unknown vendor. Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: VendorCapacityResponseDto,
    description: 'The capacity after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  setVendorCapacity(
    @Param() params: IdParamDto,
    @Body() body: SetVendorCapacityDto,
  ): Promise<VendorCapacityResponseDto> {
    return notImplemented('SCH-API-2', params, body);
  }

  @Put('vendors/:id/capacity/:date')
  @ApiTags(API_TAGS.adminVendorCapacity.name)
  @ApiOperation({
    operationId: 'adminSetVendorDayCapacity',
    summary: 'Set one day’s limits',
    description:
      'Admin dashboard, capacity calendar. A past day: VALIDATION_FAILED `notPast` on `date`. A limit below what is booked keeps the bookings and closes the day. Audited. NOT_FOUND for an unknown vendor. Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: VendorCapacityResponseDto,
    description: 'The capacity after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  setVendorDayCapacity(
    @Param() params: VendorCapacityDateParamDto,
    @Body() body: SetVendorDayCapacityDto,
  ): Promise<VendorCapacityResponseDto> {
    return notImplemented('SCH-API-2', params, body);
  }

  @Delete('vendors/:id/capacity/:date')
  @ApiTags(API_TAGS.adminVendorCapacity.name)
  @ApiOperation({
    operationId: 'adminClearVendorDayCapacity',
    summary: 'Remove one day’s limits',
    description:
      'Admin dashboard, capacity calendar: the day goes back to the daily limits. NOT_FOUND for an unknown vendor or a day without its own limits. Audited. Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: VendorCapacityResponseDto,
    description: 'The capacity after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  clearVendorDayCapacity(
    @Param() params: VendorCapacityDateParamDto,
  ): Promise<VendorCapacityResponseDto> {
    return notImplemented('SCH-API-2', params);
  }
}
