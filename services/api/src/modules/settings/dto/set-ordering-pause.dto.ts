import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';
import { trimText } from '@common/dto/trim-text';

/** Pauses or resumes new orders; pausing needs the message in both languages. */
export class SetOrderingPauseDto {
  @ApiProperty({
    example: true,
    description: '`true`: pause new orders now; `false`: resume.',
  })
  @IsBoolean()
  isPaused!: boolean;

  @ApiPropertyOptional({
    example: 'نعتذر، الطلبات متوقفة مؤقتًا',
    description:
      'The message in Arabic, 1 to 200 characters; required when pausing, ignored when resuming.',
  })
  @ValidateIf((dto: SetOrderingPauseDto) => dto.isPaused)
  @Transform(trimText)
  @IsString()
  @Length(1, 200)
  messageAr?: string;

  @ApiPropertyOptional({
    example: 'Ordering is paused for now.',
    description:
      'The message in English, 1 to 200 characters; required when pausing, ignored when resuming.',
  })
  @ValidateIf((dto: SetOrderingPauseDto) => dto.isPaused)
  @Transform(trimText)
  @IsString()
  @Length(1, 200)
  messageEn?: string;
}
