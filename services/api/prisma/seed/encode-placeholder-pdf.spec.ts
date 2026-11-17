import { detectContentType } from '@common/files/detect-content-type';
import { encodePlaceholderPdf } from './encode-placeholder-pdf';

describe('encodePlaceholderPdf', () => {
  it('is detected as a PDF, as MediaService checks an upload', () => {
    expect(detectContentType(encodePlaceholderPdf(['Title']))).toBe(
      'application/pdf',
    );
  });

  it('points the cross-reference table at each object', () => {
    const pdf = encodePlaceholderPdf(['Title', 'A (note)']).toString('latin1');
    const offsets = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) =>
      Number(match[1]),
    );
    expect(offsets).toHaveLength(5);
    offsets.forEach((offset, index) => {
      expect(pdf.startsWith(`${index + 1} 0 obj`, offset)).toBe(true);
    });
    const startXref = Number(/startxref\n(\d+)/.exec(pdf)?.[1]);
    expect(pdf.startsWith('xref', startXref)).toBe(true);
  });

  it('escapes parentheses in the text', () => {
    expect(encodePlaceholderPdf(['A (note)']).toString('latin1')).toContain(
      'A \\(note\\)',
    );
  });

  it('refuses text the standard font cannot show', () => {
    expect(() => encodePlaceholderPdf(['سجل تجاري'])).toThrow(RangeError);
  });
});
