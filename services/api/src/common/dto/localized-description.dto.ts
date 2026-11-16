import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { toOptionalText } from './to-optional-text';

/**
 * A description in either language, or neither: up to 1000 characters each. In an
 * update, a language left out stays as it is and null (or blank) clears it.
 */
export class LocalizedDescriptionDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: 1000,
    example: 'لحوم بلدية طازجة يوميًا',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  ar?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: 1000,
    example: 'Fresh local meat every day',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  en?: string | null;
}
