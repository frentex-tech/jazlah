import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { WalletResponseDto } from '../dto/wallet-response.dto';
import { WalletTransactionPageResponseDto } from '../dto/wallet-transaction-page-response.dto';

/**
 * The customer’s wallet (WAL-API-1). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerWalletController {
  @Get('wallet')
  @ApiTags(API_TAGS.customerWallet.name)
  @ApiOperation({
    operationId: 'customerGetWallet',
    summary: 'My wallet balance',
    description:
      'Customer app, wallet and the payment step. Until WAL-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: WalletResponseDto,
    description: 'The balance.',
  })
  @ApiErrorResponses(
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  getWallet(): Promise<WalletResponseDto> {
    return notImplemented('WAL-API-1');
  }

  @Get('wallet/transactions')
  @ApiTags(API_TAGS.customerWallet.name)
  @ApiOperation({
    operationId: 'customerListWalletTransactions',
    summary: 'My wallet history',
    description:
      'Customer app, wallet history: newest first. Until WAL-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: WalletTransactionPageResponseDto,
    description: 'One page of movements.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  listWalletTransactions(
    @Query() query: PageQueryDto,
  ): Promise<WalletTransactionPageResponseDto> {
    return notImplemented('WAL-API-1', query);
  }
}
