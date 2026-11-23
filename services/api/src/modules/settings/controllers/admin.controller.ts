import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { OperationsSettingsResponseDto } from '../dto/operations-settings-response.dto';
import { SetOrderingPauseDto } from '../dto/set-ordering-pause.dto';
import { UpdateOperationsSettingsDto } from '../dto/update-operations-settings.dto';

/**
 * The operations settings (SCH-API-1): every change is applied at once and audited. Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminSettingsController {
  @Get('settings/operations')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminGetOperationsSettings',
    summary: 'The operations settings',
    description:
      'Admin dashboard, operations page. Until SCH-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings.',
  })
  @ApiErrorResponses(
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getOperationsSettings(): Promise<OperationsSettingsResponseDto> {
    return notImplemented('SCH-API-1');
  }

  @Patch('settings/operations')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminUpdateOperationsSettings',
    summary: 'Change the operations settings',
    description:
      'Admin dashboard, operations page "save": only the keys sent change (a stale tab cannot undo another change it did not send); the pause is not here. A closed day added in the past: VALIDATION_FAILED `notPast` on `closedDays.<i>.date`; a window ending before it starts: `endBeforeStart`. The next cart and checkout reads use the new values. Until SCH-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  updateOperationsSettings(
    @Body() body: UpdateOperationsSettingsDto,
  ): Promise<OperationsSettingsResponseDto> {
    return notImplemented('SCH-API-1', body);
  }

  @Put('settings/operations/pause')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminSetOrderingPause',
    summary: 'Pause or resume new orders',
    description:
      'Admin dashboard, the pause switch. Pausing makes every cart change and checkout call answer ORDERING_PAUSED with the message; orders already placed carry on. Until SCH-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  setOrderingPause(
    @Body() body: SetOrderingPauseDto,
  ): Promise<OperationsSettingsResponseDto> {
    return notImplemented('SCH-API-1', body);
  }
}
