import { El_Messiri, Readex_Pro } from 'next/font/google';

// Build fonts from docs/design/tokens.json (font.*.family). Figma uses Thmanyah; not bundled until its licence is checked.
export const body = Readex_Pro({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700'], variable: '--font-body', display: 'swap' });
export const display = El_Messiri({ subsets: ['arabic', 'latin'], weight: ['700'], variable: '--font-display', display: 'swap' });
