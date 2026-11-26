import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { ClientSettingsResponseDto } from '../dto/client-settings-response.dto';
import { OperationsSettingsService } from '../operations-settings.service';
import { toClientSettingsResponse } from '../to-client-settings-response';

/**
 * What the apps need of the operations settings (SCH-API-1).
 */
@Controller('public/settings')
export class PublicSettingsController {
  constructor(private readonly settings: OperationsSettingsService) {}

  @Get('client')
  @ApiTags(API_TAGS.publicSettings.name)
  @ApiOperation({
    operationId: 'publicGetClientSettings',
    summary: 'Settings for the apps',
    description:
      'Customer app (cart, checkout) and the dashboard’s pause banner: delivery window, booking horizon, minimum order, delivery fee, cash on delivery and the pause. Public; cache for a minute at most.',
  })
  @ApiOkResponse({
    type: ClientSettingsResponseDto,
    description: 'The settings.',
  })
  @ApiErrorResponses(ErrorCode.SERVICE_UNAVAILABLE, ErrorCode.RATE_LIMITED)
  async getClientSettings(): Promise<ClientSettingsResponseDto> {
    return toClientSettingsResponse(await this.settings.current());
  }
}
