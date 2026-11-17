import { ApiProperty } from '@nestjs/swagger';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { CustomerAddressResponseDto } from './customer-address-response.dto';

/**
 * Every saved address of the customer, the default first, then newest first. Not paged:
 * there are at most ten (an exception to the list convention, `http.md`, "Lists").
 */
export class CustomerAddressListResponseDto {
  @ApiProperty({
    type: [CustomerAddressResponseDto],
    maxItems: CUSTOMER_LIMITS.addresses,
    description: `Every saved address of the customer: the default first, then newest first. At most ${CUSTOMER_LIMITS.addresses}; empty when none is saved.`,
  })
  items!: CustomerAddressResponseDto[];
}
