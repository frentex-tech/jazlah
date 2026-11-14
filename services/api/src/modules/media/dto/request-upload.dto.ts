import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { UploadPurpose } from '../upload-purpose.type';
import { UPLOAD_PURPOSES } from '../upload-purposes.constants';

/** The body of a request for an upload ticket. */
export class RequestUploadDto {
  @ApiProperty({
    enum: Object.keys(UPLOAD_PURPOSES),
    example: 'catalog.product-image',
    description:
      'Why the file is uploaded; decides the accepted types, size and visibility.',
  })
  @IsIn(Object.keys(UPLOAD_PURPOSES))
  purpose!: UploadPurpose;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'The Content-Type the file will be uploaded with.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  contentType!: string;

  @ApiPropertyOptional({
    example: 'product.jpg',
    description:
      'The file name on the device; shown back, never used as a path.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
