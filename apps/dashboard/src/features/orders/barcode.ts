// Code 39 bars for the order label (135:49613 draws a barcode): order numbers are A–Z, 0–9 and «-», which Code 39
// encodes without a check digit, so no barcode library is needed. Each pattern is 12 modules (wide = 2), start/stop «*».
const CODE39: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101', '4': '101001101011', '5': '110100110101',
  '6': '101100110101', '7': '101001011011', '8': '110100101101', '9': '101100101101', A: '110101001011', B: '101101001011',
  C: '110110100101', D: '101011001011', E: '110101100101', F: '101101100101', G: '101010011011', H: '110101001101',
  I: '101101001101', J: '101011001101', K: '110101010011', L: '101101010011', M: '110110101001', N: '101011010011',
  O: '110101101001', P: '101101101001', Q: '101010110011', R: '110101011001', S: '101101011001', T: '101011011001',
  U: '110010101011', V: '100110101011', W: '110011010101', X: '100101101011', Y: '110010110101', Z: '100110110101',
  '-': '100101011011', '*': '100101101101',
};

/** The modules of `text` (1 = bar), characters split by one narrow space; null when it has a character Code 39 lacks. */
export function code39(text: string): string | null {
  const chars = `*${text.toUpperCase()}*`.split('');
  if (chars.some((c) => !CODE39[c])) return null;
  return chars.map((c) => CODE39[c]).join('0');
}
