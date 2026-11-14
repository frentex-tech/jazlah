import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  type DownloadLink,
  type MediaFile,
  MediaService,
  RequestUploadDto,
  type UploadTicket,
} from '@modules/media';

/**
 * Test-only endpoints over MediaService, standing in for the controllers that come with
 * authentication (an unauthenticated upload endpoint would be abusable, so the API has
 * none). Mounted beside AppModule by the media e2e tests: `/v1/test/media/...`.
 */
@Controller('test/media')
export class MediaProbeController {
  constructor(private readonly media: MediaService) {}

  @Post('uploads')
  requestUpload(@Body() body: RequestUploadDto): Promise<UploadTicket> {
    return this.media.requestUpload(body);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  confirm(@Param('id', ParseUUIDPipe) id: string): Promise<MediaFile> {
    return this.media.confirmUpload(id);
  }

  @Get(':id/download-link')
  downloadLink(@Param('id', ParseUUIDPipe) id: string): Promise<DownloadLink> {
    return this.media.getDownloadLink(id);
  }
}
