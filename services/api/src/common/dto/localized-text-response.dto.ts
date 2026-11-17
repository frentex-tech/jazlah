import { ApiProperty } from '@nestjs/swagger';

/** A text in both languages. */
export class LocalizedTextResponseDto {
  @ApiProperty({ description: 'The text in Arabic.', example: 'ملحمة النخبة' })
  ar!: string;

  @ApiProperty({
    description: 'The text in English.',
    example: 'Al Nokhba Butchery',
  })
  en!: string;
}
