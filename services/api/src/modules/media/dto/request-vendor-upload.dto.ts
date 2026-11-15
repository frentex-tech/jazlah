import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AUDIENCE_UPLOAD_PURPOSES } from '../audience-upload-purposes.constants';
import { RequestUploadDto } from './request-upload.dto';

/** The body of a vendor's request for an upload ticket: only the vendor audience's purposes. */
export class RequestVendorUploadDto extends PickType(RequestUploadDto, [
  'contentType',
  'fileName',
] as const) {
  @ApiProperty({
    enum: AUDIENCE_UPLOAD_PURPOSES.vendor,
    example: AUDIENCE_UPLOAD_PURPOSES.vendor[0],
    description:
      'Why the file is uploaded; decides the accepted types, size and visibility.',
  })
  @IsIn(AUDIENCE_UPLOAD_PURPOSES.vendor)
  purpose!: (typeof AUDIENCE_UPLOAD_PURPOSES.vendor)[number];
}
