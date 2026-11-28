-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "saved_address_id" UUID;

-- CreateIndex
CREATE INDEX "orders_saved_address_id_idx" ON "orders"("saved_address_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_saved_address_id_fkey" FOREIGN KEY ("saved_address_id") REFERENCES "customer_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
