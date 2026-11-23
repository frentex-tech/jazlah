/** Halalas (integer, VAT included) as the frames show them: «1,180.00 ر.س» / «SAR 1,180.00». */
// Latin digits with a comma for thousands in both languages, as every frame writes amounts («1,180.00 ر.س»).
const amount = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const sar = (halalas: number, locale: string) => {
  const v = amount.format(halalas / 100);
  return locale === 'en' ? `SAR ${v}` : `${v} ر.س`;
};

/** What the admin types in SAR («45», «45.5», «٤٥٫٠٠») → halalas; null when it is not an amount (0 allowed). */
export function halalasOf(input: string): number | null {
  const s = input.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

/** Halalas → the SAR text an input shows («4500» → «45.00»). */
export const sarInput = (halalas: number) => (halalas / 100).toFixed(2);
