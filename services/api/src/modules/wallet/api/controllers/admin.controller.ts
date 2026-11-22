import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
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
import { AdjustWalletDto } from '../dto/adjust-wallet.dto';
import { WalletResponseDto } from '../dto/wallet-response.dto';

/**
 * Customers’ wallets as admins see them (WAL-API-1). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminWalletController {
  @Get('customers/:id/wallet')
  @ApiTags(API_TAGS.adminWallets.name)
  @ApiOperation({
    operationId: 'adminGetCustomerWallet',
    summary: 'A customer’s wallet balance',
    description:
      'Admin dashboard, customer screen. NOT_FOUND for an unknown customer. Until WAL-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: WalletResponseDto,
    description: 'The balance.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getCustomerWallet(@Param() params: IdParamDto): Promise<WalletResponseDto> {
    return notImplemented('WAL-API-1', params);
  }

  @Post('customers/:id/wallet/adjustments')
  @ApiTags(API_TAGS.adminWallets.name)
  @ApiOperation({
    operationId: 'adminAdjustCustomerWallet',
    summary: 'Credit or debit a customer’s wallet',
    description:
      'Admin dashboard, customer screen (and staging demos). A retry with the same `Idempotency-Key` answers the first result and moves nothing. Recorded in the wallet ledger and the audit log with the reason. WALLET_INSUFFICIENT (`details.balanceHalalas`) for a debit beyond the balance; NOT_FOUND for an unknown customer. Until WAL-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description:
      'A UUID the app makes once per attempt and sends again on a retry of the same attempt: the same key answers the first success again (the body is not compared); a refusal is not kept, so the same key may be sent again after fixing it. Missing or not a UUID: VALIDATION_FAILED on `Idempotency-Key`.',
    schema: {
      type: 'string',
      format: 'uuid',
      example: '3c1f8e2a-5b7d-4c9e-a1f0-6d2b8c4e7a90',
    },
  })
  @ApiCreatedResponse({
    type: WalletResponseDto,
    description: 'The balance after it.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.WALLET_INSUFFICIENT,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  adjustCustomerWallet(
    @Param() params: IdParamDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: AdjustWalletDto,
  ): Promise<WalletResponseDto> {
    return notImplemented('WAL-API-1', params, idempotencyKey, body);
  }
}
