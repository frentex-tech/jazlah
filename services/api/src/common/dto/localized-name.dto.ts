import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { trimText } from './trim-text';

/** A name in both languages, each 2 to 100 characters. */
export class LocalizedNameDto {
  @ApiProperty({
    description: 'The name in Arabic, 2 to 100 characters; trimmed.',
    minLength: 2,
    maxLength: 100,
    example: 'ملحمة النخبة',
  })
  @Transform(trimText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ar!: string;

  @ApiProperty({
    description: 'The name in English, 2 to 100 characters; trimmed.',
    minLength: 2,
    maxLength: 100,
    example: 'Al Nokhba Butchery',
  })
  @Transform(trimText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  en!: string;
}
