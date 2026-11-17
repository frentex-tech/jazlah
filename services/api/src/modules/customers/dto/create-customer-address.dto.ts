import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { trimText } from '@common/dto/trim-text';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { CustomerAddressTextDto } from './customer-address-text.dto';

/** A new saved address. */
export class CreateCustomerAddressDto extends CustomerAddressTextDto {
  @ApiProperty({
    minLength: 1,
    maxLength: CUSTOMER_LIMITS.labelMax,
    description: `The customer's name for the address (Home, Work), shown in the address list. Required; 1 to ${CUSTOMER_LIMITS.labelMax} characters after surrounding spaces are removed, counted in Unicode code points (an emoji with a variation selector counts as 2).`,
    example: 'البيت',
  })
  @Transform(trimText)
  @IsString()
  @CharLength(1, CUSTOMER_LIMITS.labelMax)
  label!: string;

  @ApiProperty({
    type: GeoPointDto,
    description:
      'The point the customer picked on the map, in degrees (JSON numbers, not strings). Required.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoPointDto)
  location!: GeoPointDto;

  @ApiPropertyOptional({
    description:
      "true makes this address the default instead of the current one; false or left out keeps the current default. The customer's first address becomes the default anyway.",
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
