import type { LocalizedText } from '@common/i18n/localized-text.type';

/** The active coverage zone a point lies in: what callers need to name it. */
export type CoveringZone = Readonly<{
  id: string;
  name: LocalizedText;
  city: string;
}>;
