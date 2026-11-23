import { resolveLanguage } from './resolve-language';

describe('resolveLanguage', () => {
  it.each([
    [undefined, 'ar'],
    ['', 'ar'],
    ['en', 'en'],
    ['en-US', 'en'],
    ['EN-gb', 'en'],
    ['ar', 'ar'],
    ['ar-SA,en;q=0.9', 'ar'],
    ['en-US,en;q=0.9,ar;q=0.8', 'en'],
    ['ar;q=0.5,en;q=0.6', 'en'],
    ['ar,en', 'ar'],
    ['en;q=0.5,ar;q=0.5', 'ar'],
    ['fr-FR,de', 'ar'],
    ['fr,en;q=0.4', 'en'],
    ['en;q=0', 'ar'],
    ['en;q=abc', 'ar'],
    ['*', 'ar'],
  ] as const)('%p resolves to %p', (header, expected) => {
    expect(resolveLanguage(header)).toBe(expected);
  });
});
