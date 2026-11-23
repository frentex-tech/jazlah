import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { CouponPageResponseDto } from '../dto/coupon-page-response.dto';
import { CouponResponseDto } from '../dto/coupon-response.dto';
import { CouponUsageResponseDto } from '../dto/coupon-usage-response.dto';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { ListCouponsQueryDto } from '../dto/list-coupons-query.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

/**
 * Coupons (CRT-API-3); every change is audited. Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminCouponsController {
  @Get('coupons')
  @ApiTags(API_TAGS.adminCoupons.name)
  @ApiOperation({
    operationId: 'adminListCoupons',
    summary: 'Coupons',
    description:
      'Admin dashboard, marketing, coupons list: newest first, by state or part of the code. Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CouponPageResponseDto,
    description: 'One page of coupons.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  listCoupons(
    @Query() query: ListCouponsQueryDto,
  ): Promise<CouponPageResponseDto> {
    return notImplemented('CRT-API-3', query);
  }

  @Post('coupons')
  @ApiTags(API_TAGS.adminCoupons.name)
  @ApiOperation({
    operationId: 'adminCreateCoupon',
    summary: 'Create a coupon',
    description:
      'Admin dashboard, new coupon form. COUPON_CODE_TAKEN for a code in use, in any case. Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiCreatedResponse({
    type: CouponResponseDto,
    description: 'The coupon.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.COUPON_CODE_TAKEN,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  createCoupon(@Body() body: CreateCouponDto): Promise<CouponResponseDto> {
    return notImplemented('CRT-API-3', body);
  }

  @Get('coupons/:id')
  @ApiTags(API_TAGS.adminCoupons.name)
  @ApiOperation({
    operationId: 'adminGetCoupon',
    summary: 'One coupon',
    description:
      'Admin dashboard, coupon form. NOT_FOUND for an unknown coupon. Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CouponResponseDto,
    description: 'The coupon.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getCoupon(@Param() params: IdParamDto): Promise<CouponResponseDto> {
    return notImplemented('CRT-API-3', params);
  }

  @Patch('coupons/:id')
  @ApiTags(API_TAGS.adminCoupons.name)
  @ApiOperation({
    operationId: 'adminUpdateCoupon',
    summary: 'Change a coupon',
    description:
      'Admin dashboard, coupon form "save" and "switch off" (`{ isActive: false }`): only the fields sent change. COUPON_CODE_TAKEN; NOT_FOUND. Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CouponResponseDto,
    description: 'The coupon after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.COUPON_CODE_TAKEN,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  updateCoupon(
    @Param() params: IdParamDto,
    @Body() body: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return notImplemented('CRT-API-3', params, body);
  }

  @Get('coupons/:id/usage')
  @ApiTags(API_TAGS.adminCoupons.name)
  @ApiOperation({
    operationId: 'adminGetCouponUsage',
    summary: 'How a coupon was used',
    description:
      'Admin dashboard, coupon detail. NOT_FOUND for an unknown coupon. Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CouponUsageResponseDto,
    description: 'The usage.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getCouponUsage(@Param() params: IdParamDto): Promise<CouponUsageResponseDto> {
    return notImplemented('CRT-API-3', params);
  }
}
