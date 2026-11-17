/**
 * The in-memory copy of the SQL function `catalog_search_text` (migration
 * `20261117150000_catalog_design_followups`), for the fakes only: Arabic diacritics
 * (U+064B to U+065F, U+0670) and tatweel removed, أ إ آ as ا, ى as ي, ة as ه, lowercased.
 * The real search normalises in the database; the e2e tests prove that one.
 */
export function searchTextOf(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}
