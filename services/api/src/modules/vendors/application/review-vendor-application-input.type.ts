/** Who reviews which application: the admin from the access token. */
export type ReviewVendorApplicationInput = Readonly<{
  applicationId: string;
  reviewerId: string;
}>;
