import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { trimText } from '@common/dto/trim-text';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { CustomerAddressTextDto } from './customer-address-text.dto';

/** A new saved address. */
export class CreateCustomerAddressDto extends CustomerAddressTextDto {
  @ApiProperty({
    minLength: 1,
    maxLength: CUSTOMER_LIMITS.labelMax,
    description: "The customer's name for it.",
    example: 'البيت',
  })
  @Transform(trimText)
  @IsString()
  @MinLength(1)
  @MaxLength(CUSTOMER_LIMITS.labelMax)
  label!: string;

  @ApiProperty({
    type: GeoPointDto,
    description: 'The point picked on the map.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoPointDto)
  location!: GeoPointDto;

  @ApiPropertyOptional({
    description:
      'Makes it the default address instead of the current one. The first address is the default anyway.',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
