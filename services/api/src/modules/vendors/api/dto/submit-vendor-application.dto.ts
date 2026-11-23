import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS } from '../../domain/required-vendor-application-document-kinds.constants';
import { VENDOR_APPLICATION_DOCUMENT_KINDS } from '../../domain/vendor-application-document-kinds.constants';
import { VENDOR_APPLICATION_DOCUMENT_LIMITS } from '../../domain/vendor-application-document-limits.constants';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { IsSaudiIban } from './is-saudi-iban.decorator';
import { LocalizedDescriptionDto } from '@common/dto/localized-description.dto';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { toDigits } from './to-digits';
import { toIbanElectronicForm } from './to-iban-electronic-form';
import { trimText } from '@common/dto/trim-text';
import { VendorApplicationDocumentDto } from './vendor-application-document.dto';
import { CharLength } from '@common/decorators/char-length.decorator';
import { toCompactText } from '@common/dto/to-compact-text';
import { VENDOR_FIELD_LIMITS } from '../../domain/vendor-field-limits.constants';
import { VAT_NUMBER_PATTERN } from './vat-number-pattern.constants';

/** The body of a vendor application (FR-VND-01). */
export class SubmitVendorApplicationDto {
  @ApiProperty({
    type: LocalizedNameDto,
    description:
      'The store name customers will see, in Arabic and English (both required).',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

  @ApiPropertyOptional({
    type: LocalizedDescriptionDto,
    description:
      'An optional store description in Arabic and English; omit it, or either language, when there is none.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description?: LocalizedDescriptionDto;

  @ApiProperty({
    description:
      'The commercial registration number: 10 digits, Latin or Arabic.',
    example: '1010123456',
  })
  @Transform(toDigits)
  @IsString()
  @Matches(/^\d{10}$/)
  commercialRegistrationNumber!: string;

  @ApiPropertyOptional({
    description:
      'The VAT registration number, optional: 15 digits starting and ending with 3, Latin or Arabic. Omit it when the business is not registered for VAT.',
    example: '310123456700003',
  })
  @Transform(toDigits)
  @IsOptional()
  @IsString()
  @Matches(VAT_NUMBER_PATTERN)
  vatNumber?: string;

  @ApiProperty({
    minLength: VENDOR_FIELD_LIMITS.city.min,
    maxLength: VENDOR_FIELD_LIMITS.city.max,
    description: `The city the store is in, as written (Arabic expected): ${VENDOR_FIELD_LIMITS.city.min} to ${VENDOR_FIELD_LIMITS.city.max} characters after invisible format characters are removed and spaces trimmed. Shown on the public store page.`,
    example: 'الرياض',
  })
  @Transform(toCompactText)
  @IsString()
  @CharLength(VENDOR_FIELD_LIMITS.city.min, VENDOR_FIELD_LIMITS.city.max)
  city!: string;

  @ApiProperty({
    description:
      'The Saudi IBAN of the account payouts go to (SA and 22 more characters; spaces allowed). Never returned: responses show it masked.',
    example: 'SA03 8000 0000 6080 1016 7519',
  })
  @Transform(({ value }: { value: unknown }) => toIbanElectronicForm(value))
  @IsSaudiIban()
  iban!: string;

  @ApiProperty({
    minLength: 2,
    maxLength: 100,
    description:
      'The name on the payout bank account, 2 to 100 characters; trimmed.',
    example: 'مؤسسة النخبة للحوم',
  })
  @Transform(trimText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  accountHolderName!: string;

  @ApiProperty({
    type: GeoPointDto,
    description: 'Where the facility (shop or slaughterhouse) is.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoPointDto)
  location!: GeoPointDto;

  @ApiProperty({
    type: [VendorApplicationDocumentDto],
    description: `At least one document of each required kind (${REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS.join(', ')}); the other kinds (${VENDOR_APPLICATION_DOCUMENT_KINDS.filter((kind) => !REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS.includes(kind)).join(', ')}) are optional. Each file once, at most ${VENDOR_APPLICATION_DOCUMENT_LIMITS.max} in all.`,
    minItems: REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS.length,
    maxItems: VENDOR_APPLICATION_DOCUMENT_LIMITS.max,
  })
  @IsDefined()
  @IsArray()
  @ArrayMinSize(REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS.length)
  @ArrayMaxSize(VENDOR_APPLICATION_DOCUMENT_LIMITS.max)
  @ValidateNested({ each: true })
  @Type(() => VendorApplicationDocumentDto)
  documents!: VendorApplicationDocumentDto[];
}
