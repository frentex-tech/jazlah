-- Categories get a display order set by admins (lower first); the public categories are
-- returned by it. The check constraint is added by hand (Prisma cannot express it).

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "categories_is_active_sort_order_created_at_id_idx" ON "categories"("is_active", "sort_order", "created_at", "id");

-- A display order is never negative.
ALTER TABLE "categories" ADD CONSTRAINT "categories_sort_order_check" CHECK ("sort_order" >= 0);
