import type { CustomerProfile } from './customer-profile.type';
import type { CustomerProfileResponseDto } from './dto/customer-profile-response.dto';

/** A profile as the client sees it. */
export function toCustomerProfileResponse(
  profile: CustomerProfile,
): CustomerProfileResponseDto {
  return {
    fullName: profile.fullName,
    email: profile.email,
    preferredLanguage: profile.preferredLanguage,
    isComplete: profile.isComplete,
  };
}
