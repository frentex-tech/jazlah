import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';

/** A vendor as anyone sees it (FR-CAT-02): who it is, in both languages, its logo, cover photo and city. */
export class PublicVendorResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The vendor (store) id, a UUID.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description:
      'The store name in Arabic and English, as approved from its application.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: OptionalLocalizedTextResponseDto,
    description:
      'The store description in Arabic and English; either language is null when not written.',
  })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The logo’s stable public URL, to show as is (it does not expire); null when the vendor has no logo.',
    example:
      'https://cdn.example.com/vendor/logo/2026/11/15/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b/2c9d4e1f-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
  })
  logoUrl!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The cover photo’s stable public URL (the wide image at the top of the store page), to show as is; null when the vendor has none.',
    example:
      'https://cdn.example.com/vendor/cover/2026/11/17/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b/3d0e5f2a-7b8c-4d9e-8f1a-2b3c4d5e6f7a',
  })
  coverUrl!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The city the store is in, as written (usually Arabic); null for stores approved before the city was asked and for the platform vendor.',
    example: 'الرياض',
  })
  city!: string | null;
}
