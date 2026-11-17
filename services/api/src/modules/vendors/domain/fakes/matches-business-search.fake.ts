import type { LocalizedText } from '@common/i18n/localized-text.type';

/**
 * The fakes' version of the admin search (businessSearchCondition in infrastructure):
 * `q` contained, ignoring case, in either name or in the commercial registration number.
 * Literal, like the escaped pattern; Arabic digits are not converted here.
 */
export function matchesBusinessSearch(
  q: string,
  name: LocalizedText,
  commercialRegistrationNumber: string | null,
): boolean {
  const needle = q.toLowerCase();
  return (
    name.ar.toLowerCase().includes(needle) ||
    name.en.toLowerCase().includes(needle) ||
    (commercialRegistrationNumber ?? '').includes(q)
  );
}
