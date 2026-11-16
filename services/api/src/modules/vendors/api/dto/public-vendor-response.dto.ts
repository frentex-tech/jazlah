import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';

/** A vendor as anyone sees it (FR-CAT-02): who it is, in both languages, and its logo. */
export class PublicVendorResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ type: OptionalLocalizedTextResponseDto })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The logo’s stable public URL; null without a logo.',
    example: 'https://cdn.example.com/media/vendor/logo/2026/11/15/…',
  })
  logoUrl!: string | null;
}
