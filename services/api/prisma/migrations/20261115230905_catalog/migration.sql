-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('draft', 'pending_review', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "product_fulfilment" AS ENUM ('delivery', 'pickup', 'both');

-- CreateEnum
CREATE TYPE "product_packaging" AS ENUM ('trays', 'bags', 'vacuum', 'none');

-- CreateEnum
CREATE TYPE "product_change_request_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meat_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meat_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutting_styles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cutting_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusion_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "exclusion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutting_packaging_incompatibilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cutting_style_id" UUID NOT NULL,
    "packaging" "product_packaging" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cutting_packaging_incompatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "meat_type_id" UUID,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "status" "product_status" NOT NULL DEFAULT 'draft',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "fulfilment" "product_fulfilment" NOT NULL,
    "min_price_halalas" INTEGER,
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMPTZ(3),
    "reviewed_at" TIMESTAMPTZ(3),
    "reviewed_by_id" UUID,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "approx_weight_grams" INTEGER NOT NULL,
    "price_halalas" INTEGER NOT NULL,
    "tag_ar" TEXT,
    "tag_en" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_cuttings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "cutting_style_id" UUID NOT NULL,
    "extra_price_halalas" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_cuttings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_packagings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "packaging" "product_packaging" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_packagings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_exclusions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "exclusion_item_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "status" "product_change_request_status" NOT NULL DEFAULT 'pending',
    "content" JSONB NOT NULL,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "reviewed_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_is_active_created_at_id_idx" ON "categories"("is_active", "created_at", "id");

-- CreateIndex
CREATE INDEX "categories_created_at_id_idx" ON "categories"("created_at", "id");

-- CreateIndex
CREATE INDEX "meat_types_is_active_created_at_id_idx" ON "meat_types"("is_active", "created_at", "id");

-- CreateIndex
CREATE INDEX "meat_types_created_at_id_idx" ON "meat_types"("created_at", "id");

-- CreateIndex
CREATE INDEX "cutting_styles_is_active_created_at_id_idx" ON "cutting_styles"("is_active", "created_at", "id");

-- CreateIndex
CREATE INDEX "cutting_styles_created_at_id_idx" ON "cutting_styles"("created_at", "id");

-- CreateIndex
CREATE INDEX "exclusion_items_is_active_created_at_id_idx" ON "exclusion_items"("is_active", "created_at", "id");

-- CreateIndex
CREATE INDEX "exclusion_items_created_at_id_idx" ON "exclusion_items"("created_at", "id");

-- CreateIndex
CREATE INDEX "cutting_packaging_incompatibilities_created_at_id_idx" ON "cutting_packaging_incompatibilities"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "cutting_packaging_incompatibilities_pair_key" ON "cutting_packaging_incompatibilities"("cutting_style_id", "packaging");

-- CreateIndex
CREATE INDEX "products_vendor_id_created_at_id_idx" ON "products"("vendor_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "products_vendor_id_status_created_at_id_idx" ON "products"("vendor_id", "status", "created_at", "id");

-- CreateIndex
CREATE INDEX "products_status_created_at_id_idx" ON "products"("status", "created_at", "id");

-- CreateIndex
CREATE INDEX "products_created_at_id_idx" ON "products"("created_at", "id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_meat_type_id_idx" ON "products"("meat_type_id");

-- CreateIndex
CREATE INDEX "products_reviewed_by_id_idx" ON "products"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "product_images_media_id_idx" ON "product_images"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_position_key" ON "product_images"("product_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_media_id_key" ON "product_images"("product_id", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_product_id_position_key" ON "product_sizes"("product_id", "position");

-- CreateIndex
CREATE INDEX "product_cuttings_cutting_style_id_idx" ON "product_cuttings"("cutting_style_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_cuttings_product_id_cutting_style_id_key" ON "product_cuttings"("product_id", "cutting_style_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_packagings_product_id_packaging_key" ON "product_packagings"("product_id", "packaging");

-- CreateIndex
CREATE INDEX "product_exclusions_exclusion_item_id_idx" ON "product_exclusions"("exclusion_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_exclusions_product_id_exclusion_item_id_key" ON "product_exclusions"("product_id", "exclusion_item_id");

-- CreateIndex
CREATE INDEX "product_change_requests_product_id_created_at_id_idx" ON "product_change_requests"("product_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "product_change_requests_status_created_at_id_idx" ON "product_change_requests"("status", "created_at", "id");

-- CreateIndex
CREATE INDEX "product_change_requests_requested_by_id_idx" ON "product_change_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "product_change_requests_reviewed_by_id_idx" ON "product_change_requests"("reviewed_by_id");

-- AddForeignKey
ALTER TABLE "cutting_packaging_incompatibilities" ADD CONSTRAINT "cutting_packaging_incompatibilities_cutting_style_id_fkey" FOREIGN KEY ("cutting_style_id") REFERENCES "cutting_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_meat_type_id_fkey" FOREIGN KEY ("meat_type_id") REFERENCES "meat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_cuttings" ADD CONSTRAINT "product_cuttings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_cuttings" ADD CONSTRAINT "product_cuttings_cutting_style_id_fkey" FOREIGN KEY ("cutting_style_id") REFERENCES "cutting_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_exclusions" ADD CONSTRAINT "product_exclusions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_exclusions" ADD CONSTRAINT "product_exclusions_exclusion_item_id_fkey" FOREIGN KEY ("exclusion_item_id") REFERENCES "exclusion_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_change_requests" ADD CONSTRAINT "product_change_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_change_requests" ADD CONSTRAINT "product_change_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_change_requests" ADD CONSTRAINT "product_change_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Written by hand: SQL Prisma cannot express (database.md, rule 2).

-- A product's review fields follow its status; a product under review or published
-- has at least one size (so a lowest price).
ALTER TABLE "products" ADD CONSTRAINT "products_min_price_check"
  CHECK ("min_price_halalas" IS NULL OR "min_price_halalas" > 0);
ALTER TABLE "products" ADD CONSTRAINT "products_review_check"
  CHECK (
    ("status" = 'rejected') = ("rejection_reason" IS NOT NULL)
    AND ("status" <> 'published' OR "published_at" IS NOT NULL)
    AND ("status" NOT IN ('pending_review', 'published') OR "min_price_halalas" IS NOT NULL)
  );

ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_values_check"
  CHECK ("approx_weight_grams" > 0 AND "price_halalas" > 0 AND "position" >= 0);
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_tag_check"
  CHECK (("tag_ar" IS NULL) = ("tag_en" IS NULL));
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_position_check"
  CHECK ("position" >= 0);
ALTER TABLE "product_cuttings" ADD CONSTRAINT "product_cuttings_extra_price_check"
  CHECK ("extra_price_halalas" >= 0);

-- One pending change request per product; the review fields follow the status.
CREATE UNIQUE INDEX "product_change_requests_product_id_pending_key"
  ON "product_change_requests" ("product_id") WHERE "status" = 'pending';
ALTER TABLE "product_change_requests" ADD CONSTRAINT "product_change_requests_review_check"
  CHECK (
    ("status" = 'pending') = ("reviewed_at" IS NULL)
    AND ("status" = 'pending') = ("reviewed_by_id" IS NULL)
    AND ("status" = 'rejected') = ("rejection_reason" IS NOT NULL)
  );

-- The public product list (newest first) and each filter: only published, available
-- rows are indexed. The vendor and category conditions are checked on the rows read.
CREATE INDEX "products_public_created_at_idx"
  ON "products" ("created_at" DESC, "id" DESC)
  WHERE "status" = 'published' AND "is_available";
CREATE INDEX "products_public_category_idx"
  ON "products" ("category_id", "created_at" DESC, "id" DESC)
  WHERE "status" = 'published' AND "is_available";
CREATE INDEX "products_public_vendor_idx"
  ON "products" ("vendor_id", "created_at" DESC, "id" DESC)
  WHERE "status" = 'published' AND "is_available";
CREATE INDEX "products_public_meat_type_idx"
  ON "products" ("meat_type_id", "created_at" DESC, "id" DESC)
  WHERE "status" = 'published' AND "is_available";
