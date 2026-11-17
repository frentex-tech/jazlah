-- Design comparison follow-ups (issue #243): text search on the public product list,
-- packaging extra prices, and category images. Prisma generated the column, index and
-- foreign key statements; the extension, the search functions, the trigger, the backfill
-- and the check constraint are written by hand (Prisma cannot express them).

-- Trigram matching for the search index (`LIKE '%…%'` through a GIN index).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- The one definition of search normalisation, used for the stored text (the trigger) and
-- for the query (the product repository): Arabic diacritics U+064B to U+065F and the
-- superscript alef U+0670 removed, tatweel U+0640 removed, alef with hamza above or below
-- and alef with madda (أ إ آ) read as alef (ا), alef maqsura (ى) as yeh (ي), teh marbuta
-- (ة) as heh (ه), then lowercased (English).
CREATE FUNCTION catalog_search_text(input text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
  AS $$
    SELECT lower(
      translate(
        regexp_replace(input, '[ً-ٰٟـ]', '', 'g'),
        U&'\0623\0625\0622\0649\0629',
        U&'\0627\0627\0627\064A\0647'
      )
    )
  $$;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "image_media_id" UUID;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "search_text" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "product_packagings" ADD COLUMN     "extra_price_halalas" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "categories_image_media_id_idx" ON "categories"("image_media_id");

-- CreateIndex
CREATE INDEX "products_search_text_idx" ON "products" USING GIN ("search_text" gin_trgm_ops);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A packaging's extra price is never negative, as a cutting's.
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_extra_price_check"
  CHECK ("extra_price_halalas" >= 0);

-- `products.search_text` is written only here: on every insert and update, from both
-- names, whatever the statement set it to.
CREATE FUNCTION products_set_search_text() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.search_text := catalog_search_text(NEW.name_ar || ' ' || NEW.name_en);
    RETURN NEW;
  END;
  $$;

CREATE TRIGGER products_search_text_trigger
  BEFORE INSERT OR UPDATE ON "products"
  FOR EACH ROW EXECUTE FUNCTION products_set_search_text();

-- Backfill the products that exist (the trigger above also fires on this update).
UPDATE "products" SET "search_text" = catalog_search_text("name_ar" || ' ' || "name_en");
