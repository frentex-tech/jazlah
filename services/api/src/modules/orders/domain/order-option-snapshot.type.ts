import type { LocalizedText } from '@common/i18n/localized-text.type';

/** A chosen option (a cutting style, a "without" item) as it was named when ordered. */
export type OrderOptionSnapshot = Readonly<{ id: string; name: LocalizedText }>;
