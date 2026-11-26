-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending_payment', 'new', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'collected', 'cancelled', 'delivery_failed', 'returned');

-- CreateEnum
CREATE TYPE "order_type" AS ENUM ('ready_meat', 'carcass', 'cooked', 'occasion', 'adha', 'mixed');

-- CreateEnum
CREATE TYPE "order_payment_method" AS ENUM ('mada', 'card', 'applepay', 'cod', 'wallet');

-- CreateEnum
CREATE TYPE "order_actor_type" AS ENUM ('system', 'customer', 'admin', 'vendor', 'kitchen', 'delivery');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "number" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "status" "order_status" NOT NULL,
    "order_type" "order_type" NOT NULL,
    "fulfilment_method" "fulfilment_method" NOT NULL,
    "fulfilment_date" DATE NOT NULL,
    "window_start" TEXT,
    "window_end" TEXT,
    "payment_method" "order_payment_method" NOT NULL,
    "subtotal_halalas" BIGINT NOT NULL,
    "discount_halalas" BIGINT NOT NULL DEFAULT 0,
    "delivery_fee_halalas" INTEGER NOT NULL,
    "vat_halalas" BIGINT NOT NULL,
    "total_halalas" BIGINT NOT NULL,
    "commission_basis_points" INTEGER NOT NULL,
    "carcasses" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "vendor_snapshot" JSONB NOT NULL,
    "address_snapshot" JSONB,
    "pickup_snapshot" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_halalas" INTEGER NOT NULL,
    "total_halalas" BIGINT NOT NULL,
    "packaging" "product_packaging",
    "notes" TEXT,
    "image_url" TEXT,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "from_status" "order_status",
    "to_status" "order_status" NOT NULL,
    "actor_type" "order_actor_type" NOT NULL,
    "actor_id" UUID,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_number_counters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "day" DATE NOT NULL,
    "last_value" INTEGER NOT NULL,

    CONSTRAINT "order_number_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_vendor_id_status_idx" ON "orders"("vendor_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_created_at_idx" ON "order_status_history"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_number_counters_day_key" ON "order_number_counters"("day");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Money and counts are never negative; a line has at least one of something.
ALTER TABLE "orders" ADD CONSTRAINT "orders_amounts_check" CHECK (
  "subtotal_halalas" >= 0 AND "discount_halalas" >= 0 AND "delivery_fee_halalas" >= 0
  AND "vat_halalas" >= 0 AND "total_halalas" >= 0
  AND "commission_basis_points" BETWEEN 0 AND 10000 AND "carcasses" >= 0
);

-- The total is what the lines and the delivery fee come to, less the discount.
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_check" CHECK (
  "total_halalas" = "subtotal_halalas" - "discount_halalas" + "delivery_fee_halalas"
);

-- A delivery order has its address and window and no pickup point; a pickup order the reverse.
ALTER TABLE "orders" ADD CONSTRAINT "orders_fulfilment_check" CHECK (
  ("fulfilment_method" = 'delivery' AND "address_snapshot" IS NOT NULL AND "pickup_snapshot" IS NULL
    AND "window_start" IS NOT NULL AND "window_end" IS NOT NULL)
  OR ("fulfilment_method" = 'pickup' AND "address_snapshot" IS NULL AND "pickup_snapshot" IS NOT NULL
    AND "window_start" IS NULL AND "window_end" IS NULL)
);

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_amounts_check" CHECK (
  "quantity" > 0 AND "unit_price_halalas" >= 0 AND "total_halalas" >= 0 AND "position" >= 0
);

ALTER TABLE "order_number_counters" ADD CONSTRAINT "order_number_counters_value_check" CHECK ("last_value" > 0);
