-- A change request never changes after it is created: an edit to a product with a
-- pending request closes it as `superseded` and opens a new one.

-- AlterEnum
ALTER TYPE "product_change_request_status" ADD VALUE 'superseded';

-- Written by hand: the review fields are set exactly when an admin decided (approved
-- or rejected); a superseded request was never reviewed. The new enum value is not
-- named here, so this runs in the same transaction as the line above.
ALTER TABLE "product_change_requests" DROP CONSTRAINT "product_change_requests_review_check";
ALTER TABLE "product_change_requests" ADD CONSTRAINT "product_change_requests_review_check"
  CHECK (
    ("status" IN ('approved', 'rejected')) = ("reviewed_at" IS NOT NULL)
    AND ("status" IN ('approved', 'rejected')) = ("reviewed_by_id" IS NOT NULL)
    AND ("status" = 'rejected') = ("rejection_reason" IS NOT NULL)
  );
