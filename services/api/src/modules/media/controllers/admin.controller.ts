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
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import { AUDIENCE_UPLOAD_PURPOSES } from '../audience-upload-purposes.constants';
import { describeUploadPurposes } from '../describe-upload-purposes';
import { MediaFileResponseDto } from '../dto/media-file-response.dto';
import { RequestAdminUploadDto } from '../dto/request-admin-upload.dto';
import { UploadTicketResponseDto } from '../dto/upload-ticket-response.dto';
import { MEDIA_OPERATION_DESCRIPTIONS } from '../media-operation-descriptions.constants';
import { MEDIA_RATE_LIMITS } from '../media-rate-limits.constants';
import { MediaService } from '../media.service';
import { toMediaFileResponse } from '../to-media-file-response';
import { toUploadTicketResponse } from '../to-upload-ticket-response';

/**
 * Uploads by an admin: a ticket for a direct upload to storage, then confirmation. The
 * file belongs to the signed-in user, and only that user can confirm it or refer to it.
 */
@ApiTags(API_TAGS.adminMedia.name)
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Post('uploads')
  @RateLimit(MEDIA_RATE_LIMITS.address)
  @ApiOperation({
    operationId: 'adminRequestMediaUpload',
    summary: 'Get a ticket to upload one file',
    description: [
      'Called by the admin dashboard to upload a vendor logo, product images (the platform vendor own products, and product edits made by an admin) and category images. The confirmed ids go in the vendor `logoMediaId`, a product `imageMediaIds` and a category `imageMediaId`.',
      '',
      MEDIA_OPERATION_DESCRIPTIONS.requestUpload,
      '',
      'Purposes accepted here (accepted types; size; who can read the file):',
      describeUploadPurposes(AUDIENCE_UPLOAD_PURPOSES.admin),
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: UploadTicketResponseDto,
    description:
      'The upload ticket: where and how to upload the file, until when, and the id to confirm.',
  })
  @ApiErrorResponses(
    ...ADMIN_AUTH_ERRORS,
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @RateLimit(MEDIA_RATE_LIMITS.confirm)
  @ApiOperation({
    operationId: 'adminConfirmMediaUpload',
    summary: 'Confirm an uploaded file',
    description: MEDIA_OPERATION_DESCRIPTIONS.confirm,
  })
  @ApiOkResponse({
    type: MediaFileResponseDto,
    description:
      'The checked file, ready to be used by its id (also when it was already confirmed).',
  })
  @ApiErrorResponses(
    ...ADMIN_AUTH_ERRORS,
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_UPLOAD_EXPIRED,
    ErrorCode.MEDIA_UPLOAD_REJECTED,
    ErrorCode.SERVICE_UNAVAILABLE,
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
