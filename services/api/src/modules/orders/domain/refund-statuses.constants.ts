/** Where a refund is: sent and waiting, done, or failed (an admin follows it up). */
export const REFUND_STATUSES = ['pending', 'succeeded', 'failed'] as const;
