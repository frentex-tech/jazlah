import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AUDIENCE_UPLOAD_PURPOSES } from '../audience-upload-purposes.constants';
import { RequestUploadDto } from './request-upload.dto';

/** The body of a customer's request for an upload ticket: only the customer audience's purposes. */
export class RequestCustomerUploadDto extends PickType(RequestUploadDto, [
  'contentType',
  'fileName',
] as const) {
  @ApiProperty({
    enum: AUDIENCE_UPLOAD_PURPOSES.customer,
    example: AUDIENCE_UPLOAD_PURPOSES.customer[0],
    description:
      'Why the file is uploaded; decides the accepted types, size and visibility.',
  })
  @IsIn(AUDIENCE_UPLOAD_PURPOSES.customer)
  purpose!: (typeof AUDIENCE_UPLOAD_PURPOSES.customer)[number];
}
