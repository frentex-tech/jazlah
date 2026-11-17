/** Characters a PDF literal string escapes with a backslash (ISO 32000-1, 7.3.4.2). */
const PDF_ESCAPED = /[\\()]/g;

/**
 * A one-page PDF showing `lines` of text (Latin characters only: the standard Helvetica
 * font), made in memory: the placeholder the seed uploads for vendor application
 * documents (commercial registration, health certificate). A minimal valid file:
 * catalog, page tree, page, content stream, font, and a cross-reference table with the
 * real byte offsets (ISO 32000-1, 7.5). The same lines always give the same bytes.
 */
export function encodePlaceholderPdf(lines: readonly string[]): Buffer {
  if (lines.some((line) => !/^[\x20-\x7e]*$/.test(line))) {
    throw new RangeError('a placeholder PDF line must be printable ASCII');
  }
  const text = lines
    .map(
      (line, index) =>
        `BT /F1 ${index === 0 ? 20 : 12} Tf 72 ${760 - index * 28} Td (${line.replace(PDF_ESCAPED, '\\$&')}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(text, 'latin1')} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body, 'latin1');
  const entries = offsets
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  body +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${entries}` +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}
