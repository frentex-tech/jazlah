-- Written by hand: the partial indexes of 20261115230905_catalog are dropped. Prisma
-- sends the status as `CAST($1::text AS product_status)`, from which PostgreSQL cannot
-- prove their `WHERE status = 'published' AND is_available`, so no public list used them
-- (measured on 50,000 products). The composite indexes below take the status and the
-- availability as index conditions instead.
DROP INDEX "products_public_created_at_idx";
DROP INDEX "products_public_category_idx";
DROP INDEX "products_public_vendor_idx";
DROP INDEX "products_public_meat_type_idx";

-- DropIndex
DROP INDEX "products_category_id_idx";

-- DropIndex
DROP INDEX "products_meat_type_id_idx";

-- CreateIndex
CREATE INDEX "products_listing_idx" ON "products"("status", "is_available", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "products_listing_category_idx" ON "products"("category_id", "status", "is_available", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "products_listing_meat_type_idx" ON "products"("meat_type_id", "status", "is_available", "created_at" DESC, "id" DESC);
