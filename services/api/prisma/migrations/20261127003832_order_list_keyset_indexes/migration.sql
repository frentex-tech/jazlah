-- CreateIndex
CREATE INDEX "orders_user_id_created_at_id_idx" ON "orders"("user_id", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "orders_vendor_id_created_at_id_idx" ON "orders"("vendor_id", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "orders_created_at_id_idx" ON "orders"("created_at" DESC, "id" DESC);
