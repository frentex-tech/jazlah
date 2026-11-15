/** The order of every keyset-paginated list: newest first, the id breaking ties (keysetAfter). */
export const KEYSET_ORDER = [
  { createdAt: 'desc' },
  { id: 'desc' },
] as const satisfies readonly Readonly<Record<string, 'desc'>>[];
