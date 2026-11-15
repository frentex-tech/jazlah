import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { MediaFileResponseDto } from '../dto/media-file-response.dto';
import { RequestAdminUploadDto } from '../dto/request-admin-upload.dto';
import { UploadTicketResponseDto } from '../dto/upload-ticket-response.dto';
import { MediaService } from '../media.service';
import { toMediaFileResponse } from '../to-media-file-response';
import { toUploadTicketResponse } from '../to-upload-ticket-response';

/**
 * Uploads by a admin: a ticket for a direct upload to storage, then confirmation. The
 * file belongs to the signed-in user, and only that user can confirm it or refer to it.
 */
@ApiTags('media')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Post('uploads')
  @ApiOperation({
    summary: 'Get a ticket to upload one file',
    description:
      'Upload the file straight to storage with the ticket, then confirm it before confirmBy.',
  })
  @ApiCreatedResponse({ type: UploadTicketResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.RATE_LIMITED,
  )
  async requestUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RequestAdminUploadDto,
  ): Promise<UploadTicketResponseDto> {
    return toUploadTicketResponse(
      await this.media.requestUpload({
        purpose: body.purpose,
        contentType: body.contentType,
        fileName: body.fileName,
        ownerId: user.userId,
      }),
    );
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm an uploaded file',
    description:
      'Checks the uploaded file (its real type and size). Confirming again returns the same file.',
  })
  @ApiOkResponse({ type: MediaFileResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_UPLOAD_EXPIRED,
    ErrorCode.MEDIA_UPLOAD_REJECTED,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.RATE_LIMITED,
  )
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<MediaFileResponseDto> {
    return toMediaFileResponse(
      await this.media.confirmOwnUpload(params.id, user.userId),
    );
  }
}
