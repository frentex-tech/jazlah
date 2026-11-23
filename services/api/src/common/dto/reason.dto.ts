import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { trimText } from './trim-text';

/** An admin's reason: rejecting an application (shown to the applicant) or suspending a vendor. */
export class ReasonDto {
  @ApiProperty({
    description:
      'Why, in the words of the admin, 1 to 500 characters; trimmed. A rejection reason is shown to the vendor or applicant, so write it for them.',
    minLength: 1,
    maxLength: 500,
    example: 'السجل التجاري منتهي، جدّده وقدّم من جديد',
  })
  @Transform(trimText)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
