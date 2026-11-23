import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, ValidateIf, ValidateNested } from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { trimText } from '@common/dto/trim-text';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { CustomerAddressTextDto } from './customer-address-text.dto';

/**
 * Changes to a saved address; a field left out stays as it is, and null clears a
 * readable field. The label and the location cannot be removed. The default changes
 * only through `POST …/default`.
 */
export class UpdateCustomerAddressDto extends CustomerAddressTextDto {
  @ApiPropertyOptional({
    minLength: 1,
    maxLength: CUSTOMER_LIMITS.labelMax,
    description: `A new name for the address (Home, Work): 1 to ${CUSTOMER_LIMITS.labelMax} characters after surrounding spaces are removed, counted in Unicode code points (an emoji with a variation selector counts as 2). Left out keeps the current label; null is VALIDATION_FAILED (an address always has a label).`,
    example: 'العمل',
  })
  @Transform(trimText)
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @CharLength(1, CUSTOMER_LIMITS.labelMax)
  label?: string;

  @ApiPropertyOptional({
    type: GeoPointDto,
    description:
      'A new point on the map, in degrees (JSON numbers). Left out keeps the current one; null is VALIDATION_FAILED (an address always has a location).',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @ValidateNested()
  @Type(() => GeoPointDto)
  location?: GeoPointDto;
}
