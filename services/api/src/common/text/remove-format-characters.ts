/**
 * Unicode format characters (`\p{Cf}`): invisible, and inserted by phones when text is
 * copied in an Arabic interface: direction marks (U+200E, U+200F, U+202A to U+202E,
 * U+2066 to U+2069), zero-width characters (U+200B, U+FEFF) and the like.
 */
const FORMAT_CHARACTERS = /\p{Cf}/gu;

/**
 * `text` without its Unicode format characters, wherever they are; everything else,
 * spaces included, unchanged. For what people paste: phone numbers
 * (normalizeSaudiMobileNumber) and verification codes.
 */
export function removeFormatCharacters(text: string): string {
  return text.replace(FORMAT_CHARACTERS, '');
}
