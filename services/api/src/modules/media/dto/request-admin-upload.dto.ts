import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AUDIENCE_UPLOAD_PURPOSES } from '../audience-upload-purposes.constants';
import { describeUploadPurposes } from '../describe-upload-purposes';
import { RequestUploadDto } from './request-upload.dto';

/** The body of an admin's request for an upload ticket: only the admin audience's purposes. */
export class RequestAdminUploadDto extends PickType(RequestUploadDto, [
  'contentType',
  'fileName',
] as const) {
  @ApiProperty({
    enum: AUDIENCE_UPLOAD_PURPOSES.admin,
    example: AUDIENCE_UPLOAD_PURPOSES.admin[0],
    description: [
      'Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:',
      '',
      describeUploadPurposes(AUDIENCE_UPLOAD_PURPOSES.admin),
    ].join('\n'),
  })
  @IsIn(AUDIENCE_UPLOAD_PURPOSES.admin)
  purpose!: (typeof AUDIENCE_UPLOAD_PURPOSES.admin)[number];
}
