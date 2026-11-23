/** A text that may be written in either language, or neither (a description). */
export type OptionalLocalizedText = Readonly<{
  ar: string | null;
  en: string | null;
}>;
