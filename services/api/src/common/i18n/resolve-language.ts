import type { Language } from './language.type';

/**
 * Picks the response language from an Accept-Language header.
 * English only when the header ranks English strictly above Arabic; Arabic otherwise,
 * including when the header is missing, malformed or names neither language.
 */
export function resolveLanguage(acceptLanguage: string | undefined): Language {
  if (!acceptLanguage) {
    return 'ar';
  }
  let arabic = 0;
  let english = 0;
  for (const entry of acceptLanguage.split(',')) {
    const [rawTag, ...params] = entry.trim().split(';');
    const primary = rawTag.trim().toLowerCase().split('-')[0];
    const quality = parseQuality(params);
    if (primary === 'ar') {
      arabic = Math.max(arabic, quality);
    } else if (primary === 'en') {
      english = Math.max(english, quality);
    }
  }
  return english > arabic ? 'en' : 'ar';
}

function parseQuality(params: string[]): number {
  for (const param of params) {
    const [key, value] = param.trim().split('=');
    if (key.trim() === 'q') {
      const quality = Number(value);
      return Number.isFinite(quality) && quality >= 0 && quality <= 1
        ? quality
        : 0;
    }
  }
  return 1;
}
