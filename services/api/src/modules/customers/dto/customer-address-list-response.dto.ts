import { ApiProperty } from '@nestjs/swagger';
import { CustomerAddressResponseDto } from './customer-address-response.dto';

/**
 * Every saved address of the customer, the default first, then newest first. Not paged:
 * there are at most ten (an exception to the list convention, `http.md`, "Lists").
 */
export class CustomerAddressListResponseDto {
  @ApiProperty({ type: [CustomerAddressResponseDto], maxItems: 10 })
  items!: CustomerAddressResponseDto[];
}
