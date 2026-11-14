import { maskPhoneNumber } from '@common/phone/mask-phone-number';
import type { CurrentUserProfile } from '../application/current-user-profile.type';
import type { PrincipalResponseDto } from './dto/principal-response.dto';

/** The principal as clients see it: the phone number masked. */
export function toPrincipalResponse(
  profile: CurrentUserProfile,
): PrincipalResponseDto {
  return {
    userId: profile.userId,
    phone: maskPhoneNumber(profile.phone),
    audience: profile.audience,
    organisationId: profile.organisationId,
    sessionId: profile.sessionId,
  };
}
