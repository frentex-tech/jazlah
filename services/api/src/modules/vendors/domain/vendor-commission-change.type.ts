/** One entry of a vendor's commission history: never changed once written. */
export type VendorCommissionChange = Readonly<{
  id: string;
  vendorId: string;
  commissionBasisPoints: number;
  /** Null for the vendor's first commission. */
  previousCommissionBasisPoints: number | null;
  /** Null when the system set it. */
  changedById: string | null;
  createdAt: Date;
}>;
