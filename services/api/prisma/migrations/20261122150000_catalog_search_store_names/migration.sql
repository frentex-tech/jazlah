-- Search semantics (owner's decisions, 2026-11-22; DECISIONS.md): every word of the query
-- must appear, anywhere in the product's names or at the start of a word of its store's
-- names; alef wasla (ٱ) reads as alef. Prisma generated the column and the index; the
-- functions, the triggers and the backfill are written by hand (Prisma cannot express them).

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "store_search_text" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "products_store_search_text_idx" ON "products" USING GIN ("store_search_text" gin_trgm_ops);

-- The one normalisation, as before, plus alef wasla U+0671 read as alef (ا).
CREATE OR REPLACE FUNCTION catalog_search_text(input text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
  AS $$
    SELECT lower(
      translate(
        regexp_replace(input, '[ً-ٰٟـ]', '', 'g'),
        U&'\0623\0625\0622\0671\0649\0629',
        U&'\0627\0627\0627\0627\064A\0647'
      )
    )
  $$;

-- The product's names as before; the store's names, after a space, in their own column so
-- a query word is matched only at the start of a store word (« لحم» is not in « ملحمه»).
CREATE OR REPLACE FUNCTION products_set_search_text() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.search_text := catalog_search_text(NEW.name_ar || ' ' || NEW.name_en);
    NEW.store_search_text := ' ' || coalesce(
      (SELECT catalog_search_text(v.name_ar || ' ' || v.name_en) FROM vendors v WHERE v.id = NEW.vendor_id),
      ''
    );
    RETURN NEW;
  END;
  $$;

-- A store renamed: its products' store search text follows (the products trigger
-- recomputes it).
CREATE FUNCTION vendors_refresh_products_search_text() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    UPDATE products SET store_search_text = '' WHERE vendor_id = NEW.id;
    RETURN NULL;
  END;
  $$;

CREATE TRIGGER vendors_products_search_text_trigger
  AFTER UPDATE OF name_ar, name_en ON "vendors"
  FOR EACH ROW
  WHEN (OLD.name_ar IS DISTINCT FROM NEW.name_ar OR OLD.name_en IS DISTINCT FROM NEW.name_en)
  EXECUTE FUNCTION vendors_refresh_products_search_text();

-- Backfill (the products trigger computes both values).
UPDATE "products" SET "store_search_text" = '';
