-- AlterEnum
-- Two optional document kinds. PostgreSQL 12 and later add enum values inside a
-- transaction; the new values are not used in this migration.
ALTER TYPE "vendor_application_document_kind" ADD VALUE 'municipality_licence';
ALTER TYPE "vendor_application_document_kind" ADD VALUE 'national_id';

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "city" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "cover_media_id" UUID,
ADD COLUMN     "vat_number" TEXT;

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "city" TEXT,
ADD COLUMN     "vat_number" TEXT;

-- CreateIndex
CREATE INDEX "vendors_cover_media_id_idx" ON "vendors"("cover_media_id");

-- CreateIndex
CREATE INDEX "vendors_city_created_at_id_idx" ON "vendors"("city", "created_at", "id");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Added by hand: Prisma cannot express check constraints.
-- A Saudi VAT number: 15 digits, starting and ending with 3.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_vat_number_check" CHECK (
  "vat_number" IS NULL OR "vat_number" ~ '^3[0-9]{13}3$'
);
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_vat_number_check" CHECK (
  "vat_number" IS NULL OR "vat_number" ~ '^3[0-9]{13}3$'
);

-- A city name of 2 to 50 characters.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_city_check" CHECK (
  "city" IS NULL OR char_length("city") BETWEEN 2 AND 50
);
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_city_check" CHECK (
  "city" IS NULL OR char_length("city") BETWEEN 2 AND 50
);

-- A contact number in E.164: a Saudi mobile or a geographic landline (011 to 017).
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_contact_phone_check" CHECK (
  "contact_phone" IS NULL OR "contact_phone" ~ '^\+966(5[0-9]{8}|1[1-467][0-9]{7})$'
);

-- A contact email stored lowercase.
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_contact_email_check" CHECK (
  "contact_email" IS NULL OR "contact_email" = lower("contact_email")
);
