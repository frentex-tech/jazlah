-- CreateEnum
CREATE TYPE "vendor_status" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "vendor_application_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "vendor_application_document_kind" AS ENUM ('commercial_registration', 'health_certificate', 'facility_photo');

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "logo_media_id" UUID,
    "is_platform" BOOLEAN NOT NULL DEFAULT false,
    "status" "vendor_status" NOT NULL DEFAULT 'active',
    "suspended_at" TIMESTAMPTZ(3),
    "suspension_reason" TEXT,
    "commission_basis_points" INTEGER NOT NULL,
    "commercial_registration_number" TEXT,
    "iban_encrypted" TEXT,
    "iban_key_id" TEXT,
    "iban_last4" TEXT,
    "account_holder_name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "application_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicant_id" UUID NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "commercial_registration_number" TEXT NOT NULL,
    "iban_encrypted" TEXT NOT NULL,
    "iban_key_id" TEXT NOT NULL,
    "iban_last4" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "vendor_application_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_application_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "kind" "vendor_application_document_kind" NOT NULL,
    "media_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_commission_changes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "commission_basis_points" INTEGER NOT NULL,
    "previous_commission_basis_points" INTEGER,
    "changed_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_commission_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendors_logo_media_id_idx" ON "vendors"("logo_media_id");

-- CreateIndex
CREATE INDEX "vendors_status_created_at_id_idx" ON "vendors"("status", "created_at", "id");

-- CreateIndex
CREATE INDEX "vendors_created_at_id_idx" ON "vendors"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_application_id_key" ON "vendors"("application_id");

-- CreateIndex
CREATE INDEX "vendor_applications_applicant_id_created_at_id_idx" ON "vendor_applications"("applicant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "vendor_applications_reviewed_by_id_idx" ON "vendor_applications"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "vendor_applications_status_created_at_id_idx" ON "vendor_applications"("status", "created_at", "id");

-- CreateIndex
CREATE INDEX "vendor_applications_created_at_id_idx" ON "vendor_applications"("created_at", "id");

-- CreateIndex
CREATE INDEX "vendor_application_documents_media_id_idx" ON "vendor_application_documents"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_application_documents_application_id_media_id_key" ON "vendor_application_documents"("application_id", "media_id");

-- CreateIndex
CREATE INDEX "vendor_commission_changes_vendor_id_created_at_id_idx" ON "vendor_commission_changes"("vendor_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "vendor_commission_changes_changed_by_id_idx" ON "vendor_commission_changes"("changed_by_id");

-- CreateIndex
CREATE INDEX "user_access_organisation_id_idx" ON "user_access"("organisation_id");

-- AddForeignKey
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "vendor_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_application_documents" ADD CONSTRAINT "vendor_application_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "vendor_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_application_documents" ADD CONSTRAINT "vendor_application_documents_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_commission_changes" ADD CONSTRAINT "vendor_commission_changes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_commission_changes" ADD CONSTRAINT "vendor_commission_changes_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Added by hand: Prisma cannot express partial unique indexes or check constraints.
-- At most one platform vendor.
CREATE UNIQUE INDEX "vendors_is_platform_key" ON "vendors"("is_platform") WHERE "is_platform";

-- The business and bank fields are null only for the platform vendor, which has none.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_business_fields_check" CHECK (
  "is_platform" OR (
    "commercial_registration_number" IS NOT NULL
    AND "iban_encrypted" IS NOT NULL
    AND "iban_key_id" IS NOT NULL
    AND "iban_last4" IS NOT NULL
    AND "account_holder_name" IS NOT NULL
    AND "latitude" IS NOT NULL
    AND "longitude" IS NOT NULL
    AND "application_id" IS NOT NULL
  )
);

-- A suspended vendor has a suspension time and reason; an active one has neither.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_suspension_check" CHECK (
  ("status" = 'suspended') = ("suspended_at" IS NOT NULL)
  AND ("status" = 'suspended') = ("suspension_reason" IS NOT NULL)
);

-- Commission in basis points: 0% to 100%.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_commission_check" CHECK ("commission_basis_points" BETWEEN 0 AND 10000);

-- Coordinates in range, both or neither.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_location_check" CHECK (
  ("latitude" IS NULL) = ("longitude" IS NULL)
  AND ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90)
  AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
);

-- One pending application per applicant; approved and rejected ones may accumulate.
CREATE UNIQUE INDEX "vendor_applications_applicant_id_pending_key" ON "vendor_applications"("applicant_id") WHERE "status" = 'pending';

-- Reviewed exactly when not pending; a rejection reason exactly when rejected.
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_review_check" CHECK (
  ("status" = 'pending') = ("reviewed_at" IS NULL)
  AND ("status" = 'pending') = ("reviewed_by_id" IS NULL)
  AND ("status" = 'rejected') = ("rejection_reason" IS NOT NULL)
);

ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_location_check" CHECK (
  "latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180
);

ALTER TABLE "vendor_commission_changes" ADD CONSTRAINT "vendor_commission_changes_commission_check" CHECK (
  "commission_basis_points" BETWEEN 0 AND 10000
  AND ("previous_commission_basis_points" IS NULL OR "previous_commission_basis_points" BETWEEN 0 AND 10000)
);
