import { ApiProperty } from '@nestjs/swagger';

/** A text in both languages. */
export class LocalizedTextResponseDto {
  @ApiProperty({ example: 'ملحمة النخبة' })
  ar!: string;

  @ApiProperty({ example: 'Al Nokhba Butchery' })
  en!: string;
}
