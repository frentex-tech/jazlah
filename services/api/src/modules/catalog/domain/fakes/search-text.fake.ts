/**
 * The in-memory copy of the SQL function `catalog_search_text` (migrations
 * `20261117150000_catalog_design_followups`, `20261122150000_catalog_search_store_names`),
 * for the fakes only: Arabic diacritics (U+064B to U+065F, U+0670) and tatweel removed,
 * أ إ آ ٱ as ا, ى as ي, ة as ه, lowercased.
 * The real search normalises in the database; the e2e tests prove that one.
 */
export function searchTextOf(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}
