import type { MarketingConsentResponseDto } from './dto/marketing-consent-response.dto';
import type { MarketingConsent } from './marketing-consent.type';

/** The marketing consent as the client sees it. */
export function toMarketingConsentResponse(
  consent: MarketingConsent,
): MarketingConsentResponseDto {
  return { granted: consent.granted, changedAt: consent.changedAt };
}
