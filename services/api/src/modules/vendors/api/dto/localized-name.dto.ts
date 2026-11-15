import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { trimText } from './trim-text';

/** A name in both languages, each 2 to 100 characters. */
export class LocalizedNameDto {
  @ApiProperty({ minLength: 2, maxLength: 100, example: 'ملحمة النخبة' })
  @Transform(trimText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ar!: string;

  @ApiProperty({ minLength: 2, maxLength: 100, example: 'Al Nokhba Butchery' })
  @Transform(trimText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  en!: string;
}
