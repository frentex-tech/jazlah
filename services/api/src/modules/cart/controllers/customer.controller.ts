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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { CartResponseDto } from '../dto/cart-response.dto';
import { MergeCartResponseDto } from '../dto/merge-cart-response.dto';
import { MergeCartDto } from '../dto/merge-cart.dto';
import { SetCartFulfilmentDto } from '../dto/set-cart-fulfilment.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

/**
 * The customer’s cart, kept on the server: one store, lines priced by the catalog’s price function, a coupon, the fulfilment, the totals (CRT-API-1, CRT-API-3, SCH-API-2). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerCartController {
  @Get('cart')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerGetCart',
    summary: 'My cart',
    description:
      'Customer app, cart tab and checkout. The cart priced today: a line whose price changed since it was accepted carries a PRICE_CHANGED issue, one that can no longer be ordered as chosen an ITEM_UNAVAILABLE issue; a coupon that stopped applying is removed. An empty cart has no vendor and no lines. Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart.',
  })
  @ApiErrorResponses(
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  getCart(): Promise<CartResponseDto> {
    return notImplemented('CRT-API-1');
  }

  @Delete('cart')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerClearCart',
    summary: 'Empty my cart',
    description:
      'Customer app, "empty cart". Removes every line, the coupon and the fulfilment. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The empty cart.',
  })
  @ApiErrorResponses(
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  clearCart(): Promise<CartResponseDto> {
    return notImplemented('CRT-API-1');
  }

  @Post('cart/items')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerAddCartItem',
    summary: 'Add to my cart',
    description:
      'Customer app, product page "add to cart". Prices the selection with the catalog’s rules; the same configuration (size, options, note) adds to its line’s quantity (past 99: VALIDATION_FAILED on `quantity`). A product of another store: CART_VENDOR_MISMATCH (`details.vendorId`, `details.vendorName`: the cart’s store) unless `replaceCart` is true. Selection refusals, in this order: PRODUCT_UNAVAILABLE, OPTION_NOT_IN_PRODUCT, SIZE_UNAVAILABLE, INCOMPATIBLE_CUTTING_PACKAGING, OPTION_REQUIRED. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart with the line.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.PRODUCT_UNAVAILABLE,
    ErrorCode.SIZE_UNAVAILABLE,
    ErrorCode.OPTION_NOT_IN_PRODUCT,
    ErrorCode.INCOMPATIBLE_CUTTING_PACKAGING,
    ErrorCode.OPTION_REQUIRED,
    ErrorCode.CART_VENDOR_MISMATCH,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  addCartItem(@Body() body: AddCartItemDto): Promise<CartResponseDto> {
    return notImplemented('CRT-API-1', body);
  }

  @Patch('cart/items/:id')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerUpdateCartItem',
    summary: 'Change a line’s quantity',
    description:
      'Customer app, cart stepper; also how the customer accepts a changed price (send the same quantity). NOT_FOUND for a line not in the cart. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_UNAVAILABLE,
    ErrorCode.SIZE_UNAVAILABLE,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  updateCartItem(
    @Param() params: IdParamDto,
    @Body() body: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return notImplemented('CRT-API-1', params, body);
  }

  @Delete('cart/items/:id')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerRemoveCartItem',
    summary: 'Remove a line',
    description:
      'Customer app, cart swipe or remove. NOT_FOUND for a line not in the cart. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  removeCartItem(@Param() params: IdParamDto): Promise<CartResponseDto> {
    return notImplemented('CRT-API-1', params);
  }

  @Post('cart/merge')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerMergeCart',
    summary: 'Move my guest cart into my account',
    description:
      'Customer app, right after sign-in, once per guest cart (then clear the device cart). An empty account cart or one of the same store: lines are merged (the same configuration sums its quantities, up to 99). Another store: the guest cart replaces it (`replacedPreviousCart`). Lines that can no longer be ordered are skipped and counted. Repeating with the same `mergeId` answers the first result. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: MergeCartResponseDto,
    description: 'The cart after the merge.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  mergeCart(@Body() body: MergeCartDto): Promise<MergeCartResponseDto> {
    return notImplemented('CRT-API-1', body);
  }

  @Post('cart/coupon')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerApplyCoupon',
    summary: 'Apply a coupon',
    description:
      'Customer app, cart "coupon code". Replaces any coupon applied. Refusals: COUPON_NOT_FOUND (unknown or switched off), COUPON_EXPIRED, COUPON_NOT_APPLICABLE (not started yet, or not for this store or these products), COUPON_MIN_ORDER (`details.minOrderHalalas`), COUPON_LIMIT_REACHED (in all or for this customer); CART_EMPTY for an empty cart. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart with the coupon.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.COUPON_NOT_FOUND,
    ErrorCode.COUPON_EXPIRED,
    ErrorCode.COUPON_NOT_APPLICABLE,
    ErrorCode.COUPON_MIN_ORDER,
    ErrorCode.COUPON_LIMIT_REACHED,
    ErrorCode.CART_EMPTY,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  applyCoupon(@Body() body: ApplyCouponDto): Promise<CartResponseDto> {
    return notImplemented('CRT-API-3', body);
  }

  @Delete('cart/coupon')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerRemoveCoupon',
    summary: 'Remove the coupon',
    description:
      'Customer app, cart. Removing none changes nothing. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until CRT-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart.',
  })
  @ApiErrorResponses(
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  removeCoupon(): Promise<CartResponseDto> {
    return notImplemented('CRT-API-3');
  }

  @Patch('cart/fulfilment')
  @ApiTags(API_TAGS.customerCart.name)
  @ApiOperation({
    operationId: 'customerSetCartFulfilment',
    summary: 'Choose delivery or pickup, and the day',
    description:
      'Customer app, checkout first step. Refusals: CART_EMPTY; FULFILMENT_NOT_SUPPORTED (a product of the cart does not allow the method); NOT_FOUND (not one of the customer’s addresses); ADDRESS_NOT_COVERED (outside every active zone); DAY_FULL; DAY_NOT_AVAILABLE (`details.reason`: PAST_CUTOFF, CLOSED, OUTSIDE_HORIZON or VENDOR_CLOSED). The capacity is reserved when the order is placed, not here. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'The cart with its fulfilment and delivery fee.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CART_EMPTY,
    ErrorCode.FULFILMENT_NOT_SUPPORTED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ADDRESS_NOT_COVERED,
    ErrorCode.DAY_FULL,
    ErrorCode.DAY_NOT_AVAILABLE,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  setCartFulfilment(
    @Body() body: SetCartFulfilmentDto,
  ): Promise<CartResponseDto> {
    return notImplemented('SCH-API-2', body);
  }
}
