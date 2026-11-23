import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { describeUploadPurposes } from '../describe-upload-purposes';
import { isUploadPurpose } from '../is-upload-purpose';
import type { UploadPurpose } from '../upload-purpose.type';
import { UPLOAD_PURPOSES } from '../upload-purposes.constants';

/**
 * The body of a request for an upload ticket. The audience endpoints take a copy limited
 * to their own purposes (RequestCustomerUploadDto and its siblings), which keep
 * `contentType` and `fileName` from here.
 */
export class RequestUploadDto {
  @ApiProperty({
    enum: Object.keys(UPLOAD_PURPOSES),
    example: 'catalog.product-image',
    description: [
      'Why the file is uploaded: decides the accepted types, the size limit and who can read the file.',
      '',
      describeUploadPurposes(
        Object.keys(UPLOAD_PURPOSES).filter(isUploadPurpose),
      ),
    ].join('\n'),
  })
  @IsIn(Object.keys(UPLOAD_PURPOSES))
  purpose!: UploadPurpose;

  @ApiProperty({
    example: 'image/jpeg',
    minLength: 1,
    maxLength: 100,
    description:
      'The MIME type of the file, one of the types its purpose accepts (see `purpose`; otherwise 415 MEDIA_CONTENT_TYPE_NOT_ALLOWED). The ticket pins it: the storage stores the file with this type, and confirmation rejects a file whose real content is another type. 1 to 100 characters.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  contentType!: string;

  @ApiPropertyOptional({
    example: 'IMG_2041.jpg',
    maxLength: 255,
    description:
      'The file name on the device, at most 255 characters. Optional. Kept for display only, cleaned up (no folders, no control characters, at most 200 characters) and returned as `originalFileName`; never used to name the stored file.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
