/** An admin's decision on a pending change request. */
export type ChangeRequestDecision = Readonly<{
  status: 'approved' | 'rejected';
  reviewerId: string;
  /** Set exactly when rejected. */
  rejectionReason: string | null;
}>;
