/**
 * When a kind of order can first be fulfilled: `leadDays` whole days after today, one
 * more when ordered after `time` (Riyadh `HH:mm`; null: no cut-off time).
 */
export type CutoffRule = Readonly<{ time: string | null; leadDays: number }>;
