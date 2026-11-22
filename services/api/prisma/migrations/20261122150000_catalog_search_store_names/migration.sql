-- Search semantics (owner's decision, 2026-11-22; DECISIONS.md): every word of the query
-- must appear in the product's names or its store's names, and alef wasla (ٱ) reads as
-- alef. No schema change: hand-written SQL only (Prisma cannot express functions or
-- triggers).

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

-- `products.search_text` now also holds the store's names, so a store name finds its
-- products through the same index.
CREATE OR REPLACE FUNCTION products_set_search_text() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.search_text := catalog_search_text(
      NEW.name_ar || ' ' || NEW.name_en || ' ' || coalesce(
        (SELECT v.name_ar || ' ' || v.name_en FROM vendors v WHERE v.id = NEW.vendor_id),
        ''
      )
    );
    RETURN NEW;
  END;
  $$;

-- A store renamed: its products' search text follows (the products trigger recomputes it).
CREATE FUNCTION vendors_refresh_products_search_text() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    UPDATE products SET search_text = '' WHERE vendor_id = NEW.id;
    RETURN NULL;
  END;
  $$;

CREATE TRIGGER vendors_products_search_text_trigger
  AFTER UPDATE OF name_ar, name_en ON "vendors"
  FOR EACH ROW
  WHEN (OLD.name_ar IS DISTINCT FROM NEW.name_ar OR OLD.name_en IS DISTINCT FROM NEW.name_en)
  EXECUTE FUNCTION vendors_refresh_products_search_text();

-- Backfill (the products trigger computes the value).
UPDATE "products" SET "search_text" = '';
