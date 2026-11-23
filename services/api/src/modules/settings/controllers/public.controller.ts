import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { ClientSettingsResponseDto } from '../dto/client-settings-response.dto';

/**
 * What the apps need of the operations settings (SCH-API-1). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@Controller('public/settings')
export class PublicSettingsController {
  @Get('client')
  @ApiTags(API_TAGS.publicSettings.name)
  @ApiOperation({
    operationId: 'publicGetClientSettings',
    summary: 'Settings for the apps',
    description:
      'Customer app (cart, checkout) and the dashboard’s pause banner: delivery window, booking horizon, minimum order, delivery fee, cash on delivery and the pause. Public; cache for a minute at most. Until SCH-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: ClientSettingsResponseDto,
    description: 'The settings.',
  })
  @ApiErrorResponses(
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.RATE_LIMITED,
  )
  getClientSettings(): Promise<ClientSettingsResponseDto> {
    return notImplemented('SCH-API-1');
  }
}
