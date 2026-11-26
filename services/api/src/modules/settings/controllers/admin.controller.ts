import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { OperationsSettingsResponseDto } from '../dto/operations-settings-response.dto';
import { SetOrderingPauseDto } from '../dto/set-ordering-pause.dto';
import { UpdateOperationsSettingsDto } from '../dto/update-operations-settings.dto';
import { OperationsSettingsService } from '../operations-settings.service';
import { toOperationsSettingsResponse } from '../to-operations-settings-response';

/**
 * The operations settings (SCH-API-1): every change is applied at once and audited.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminSettingsController {
  constructor(private readonly settings: OperationsSettingsService) {}

  @Get('settings/operations')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminGetOperationsSettings',
    summary: 'The operations settings',
    description: 'Admin dashboard, operations page.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings.',
  })
  @ApiErrorResponses(ErrorCode.SERVICE_UNAVAILABLE, ...ADMIN_AUTH_ERRORS)
  async getOperationsSettings(): Promise<OperationsSettingsResponseDto> {
    return toOperationsSettingsResponse(await this.settings.current());
  }

  @Patch('settings/operations')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminUpdateOperationsSettings',
    summary: 'Change the operations settings',
    description:
      'Admin dashboard, operations page "save": only the keys sent change (a stale tab cannot undo another change it did not send); the pause is not here. A closed day added in the past: VALIDATION_FAILED `notPast` on `closedDays.<i>.date`; a window ending before it starts: `endBeforeStart`. The next cart and checkout reads use the new values.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async updateOperationsSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateOperationsSettingsDto,
  ): Promise<OperationsSettingsResponseDto> {
    return toOperationsSettingsResponse(
      await this.settings.update(body, user.userId),
    );
  }

  @Put('settings/operations/pause')
  @ApiTags(API_TAGS.adminOperationsSettings.name)
  @ApiOperation({
    operationId: 'adminSetOrderingPause',
    summary: 'Pause or resume new orders',
    description:
      'Admin dashboard, the pause switch. Pausing makes every cart change and checkout call answer ORDERING_PAUSED with the message; orders already placed carry on.',
  })
  @ApiOkResponse({
    type: OperationsSettingsResponseDto,
    description: 'The settings after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async setOrderingPause(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetOrderingPauseDto,
  ): Promise<OperationsSettingsResponseDto> {
    return toOperationsSettingsResponse(
      await this.settings.setPause(
        body.isPaused
          ? {
              isPaused: true,
              messageAr: body.messageAr ?? null,
              messageEn: body.messageEn ?? null,
            }
          : { isPaused: false, messageAr: null, messageEn: null },
        user.userId,
      ),
    );
  }
}
