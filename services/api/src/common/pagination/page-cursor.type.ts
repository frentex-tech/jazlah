/**
 * Where a page of a list ends: the sort key of its last item. Lists are ordered newest
 * first by creation time, then id, so the next page starts strictly after it.
 */
export type PageCursor = Readonly<{ createdAt: Date; id: string }>;
