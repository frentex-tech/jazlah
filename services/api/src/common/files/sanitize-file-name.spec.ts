import { sanitizeFileName } from './sanitize-file-name';

describe('sanitizeFileName', () => {
  it('keeps an ordinary name', () => {
    expect(sanitizeFileName('product photo.jpg')).toBe('product photo.jpg');
  });

  it('keeps an Arabic name', () => {
    expect(sanitizeFileName('سجل تجاري.pdf')).toBe('سجل تجاري.pdf');
  });

  it.each([
    ['a Unix path', '../../etc/passwd', 'passwd'],
    ['a Windows path', 'C:\\Users\\someone\\photo.png', 'photo.png'],
  ])('keeps only the last segment of %s', (_label, name, expected) => {
    expect(sanitizeFileName(name)).toBe(expected);
  });

  it('removes control characters', () => {
    expect(sanitizeFileName('line\nbreak\u0000.png')).toBe('linebreak.png');
  });

  it('removes bidirectional overrides that disguise an extension', () => {
    // Displays as "photoexe.jpg" with the override, while being "photo<RLO>gpj.exe".
    expect(sanitizeFileName('photo\u202egpj.exe')).toBe('photogpj.exe');
  });

  it('normalises to NFC', () => {
    expect(sanitizeFileName('cafe\u0301.png')).toBe('caf\u00e9.png');
  });

  it('shortens a long name to 200 characters', () => {
    expect(sanitizeFileName(`${'a'.repeat(300)}.png`)).toHaveLength(200);
  });

  it.each([[''], ['   '], ['folder/'], ['..'], ['\u0000']])(
    'returns null when nothing usable is left (%j)',
    (name) => {
      expect(sanitizeFileName(name)).toBeNull();
    },
  );
});
