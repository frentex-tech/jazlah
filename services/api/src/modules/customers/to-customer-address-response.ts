import type { CustomerAddress } from './customer-address.type';
import type { CustomerAddressResponseDto } from './dto/customer-address-response.dto';

/** An address as the client sees it. */
export function toCustomerAddressResponse(
  address: CustomerAddress,
): CustomerAddressResponseDto {
  return {
    id: address.id,
    label: address.label,
    location: {
      latitude: address.location.latitude,
      longitude: address.location.longitude,
    },
    city: address.city,
    district: address.district,
    street: address.street,
    building: address.building,
    shortNationalAddress: address.shortNationalAddress,
    driverInstructions: address.driverInstructions,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}
