import { ApiProperty } from '@nestjs/swagger';

/** A text that may exist in either language, or neither (null). */
export class OptionalLocalizedTextResponseDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The text in Arabic; null when there is none.',
    example: 'لحوم بلدية طازجة يوميًا',
  })
  ar!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The text in English; null when there is none.',
    example: 'Fresh local meat every day',
  })
  en!: string | null;
}
