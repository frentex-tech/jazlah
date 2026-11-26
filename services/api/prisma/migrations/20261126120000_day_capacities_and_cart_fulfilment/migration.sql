-- CreateEnum
CREATE TYPE "fulfilment_method" AS ENUM ('delivery', 'pickup');

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "fulfilment_address_id" UUID,
ADD COLUMN     "fulfilment_date" DATE,
ADD COLUMN     "fulfilment_method" "fulfilment_method";

-- CreateTable
CREATE TABLE "day_capacities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "orders_booked" INTEGER NOT NULL DEFAULT 0,
    "carcasses_booked" INTEGER NOT NULL DEFAULT 0,
    "orders_limit" INTEGER,
    "carcasses_limit" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "day_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "day_capacities_vendor_id_date_key" ON "day_capacities"("vendor_id", "date");

-- AddForeignKey
ALTER TABLE "day_capacities" ADD CONSTRAINT "day_capacities_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Booked counts and limits are never negative; a limit of 0 closes the day for the vendor.
ALTER TABLE "day_capacities" ADD CONSTRAINT "day_capacities_counts_check" CHECK (
  "orders_booked" >= 0 AND "carcasses_booked" >= 0
  AND ("orders_limit" IS NULL OR "orders_limit" >= 0)
  AND ("carcasses_limit" IS NULL OR "carcasses_limit" >= 0)
);

-- A fulfilment is a method and a day together, with an address exactly when it is delivery.
ALTER TABLE "carts" ADD CONSTRAINT "carts_fulfilment_check" CHECK (
  ("fulfilment_method" IS NULL AND "fulfilment_date" IS NULL AND "fulfilment_address_id" IS NULL)
  OR ("fulfilment_method" = 'delivery' AND "fulfilment_date" IS NOT NULL AND "fulfilment_address_id" IS NOT NULL)
  OR ("fulfilment_method" = 'pickup' AND "fulfilment_date" IS NOT NULL AND "fulfilment_address_id" IS NULL)
);
