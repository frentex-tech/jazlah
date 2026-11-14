/** The longest file name kept, in characters (most file systems allow 255 bytes). */
const MAX_FILE_NAME_LENGTH = 200;

/**
 * C0 and C1 control characters, and the Unicode bidirectional controls that can make a
 * name display differently from what it is ("photo<RLO>gpj.exe" shows as "photoexe.jpg").
 */
function isUnsafeCharacter(character: string): boolean {
  const code = character.codePointAt(0) ?? 0;
  return (
    code <= 0x1f ||
    (code >= 0x7f && code <= 0x9f) ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x2069)
  );
}

/**
 * A client's file name made safe to store and show: only the last path segment (no
 * folders, either separator), Unicode NFC, without control or bidirectional characters,
 * trimmed, at most 200 characters. Null when nothing is left. Arabic names are kept.
 *
 * The result is display metadata only: never build a storage key or a path from it.
 */
export function sanitizeFileName(name: string): string | null {
  const lastSegment = name.split(/[\\/]/).pop() ?? '';
  const cleaned = [...lastSegment.normalize('NFC')]
    .filter((character) => !isUnsafeCharacter(character))
    .join('')
    .trim();
  // Counted in code points, so a name is never cut inside a character.
  const result = [...cleaned].slice(0, MAX_FILE_NAME_LENGTH).join('').trim();
  return result === '' || result === '.' || result === '..' ? null : result;
}
