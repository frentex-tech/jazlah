import type { CustomerMe } from '../application/customer-me.type';
import type { CustomerMeResponseDto } from './dto/customer-me-response.dto';

/**
 * The customer's `me` as the client sees it: the phone in full, on purpose (the
 * customer's own number, shown on their profile screen); every other response masks it.
 */
export function toCustomerMeResponse(me: CustomerMe): CustomerMeResponseDto {
  return {
    userId: me.userId,
    phone: me.phone,
    audience: 'customer',
    organisationId: me.organisationId,
    sessionId: me.sessionId,
    fullName: me.profile.fullName,
    email: me.profile.email,
    preferredLanguage: me.profile.preferredLanguage,
    profileComplete: me.profile.isComplete,
    marketingConsent: {
      granted: me.profile.marketingConsent.granted,
      changedAt: me.profile.marketingConsent.changedAt,
    },
  };
}
