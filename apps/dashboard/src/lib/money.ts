/** Halalas (integer, VAT included) as the frames show them: «89.00 ر.س» / «SAR 89.00». */
export const sar = (halalas: number, locale: string) => {
  const v = (halalas / 100).toFixed(2);
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
