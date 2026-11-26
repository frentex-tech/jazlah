-- CreateTable
CREATE TABLE "operations_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "singleton" BOOLEAN NOT NULL DEFAULT true,
    "delivery_window_start" TEXT NOT NULL,
    "delivery_window_end" TEXT NOT NULL,
    "cutoffs" JSONB NOT NULL,
    "default_orders_per_day" INTEGER NOT NULL,
    "default_carcasses_per_day" INTEGER NOT NULL,
    "cod_enabled" BOOLEAN NOT NULL,
    "cod_max_order_halalas" INTEGER,
    "cod_allowed_order_types" TEXT[],
    "cod_confirmation" TEXT NOT NULL,
    "booking_horizon_days" INTEGER NOT NULL,
    "min_order_halalas" INTEGER NOT NULL,
    "delivery_fee_halalas" INTEGER NOT NULL,
    "complaint_window_hours" INTEGER NOT NULL,
    "closed_days" JSONB NOT NULL,
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "pause_message_ar" TEXT,
    "pause_message_en" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "operations_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operations_settings_singleton_key" ON "operations_settings"("singleton");


-- Not expressible in Prisma: the checks the settings module's validation also enforces,
-- so a row written another way cannot break the rules the readers rely on.
ALTER TABLE "operations_settings"
  ADD CONSTRAINT "operations_settings_singleton_check" CHECK ("singleton"),
  ADD CONSTRAINT "operations_settings_delivery_window_check" CHECK (
    "delivery_window_start" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "delivery_window_end" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "delivery_window_end" > "delivery_window_start"),
  ADD CONSTRAINT "operations_settings_capacity_check" CHECK (
    "default_orders_per_day" BETWEEN 1 AND 100000
    AND "default_carcasses_per_day" BETWEEN 1 AND 100000),
  ADD CONSTRAINT "operations_settings_cod_check" CHECK (
    ("cod_max_order_halalas" IS NULL OR "cod_max_order_halalas" BETWEEN 1 AND 10000000)
    AND "cod_confirmation" IN ('auto', 'review')),
  ADD CONSTRAINT "operations_settings_amounts_check" CHECK (
    "booking_horizon_days" BETWEEN 1 AND 60
    AND "min_order_halalas" BETWEEN 0 AND 10000000
    AND "delivery_fee_halalas" BETWEEN 0 AND 1000000
    AND "complaint_window_hours" BETWEEN 1 AND 720),
  ADD CONSTRAINT "operations_settings_pause_check" CHECK (
    ("is_paused" AND "pause_message_ar" IS NOT NULL AND "pause_message_en" IS NOT NULL)
    OR (NOT "is_paused" AND "pause_message_ar" IS NULL AND "pause_message_en" IS NULL));

-- The one row, with placeholder values (SCH-API-1: "defaults are placeholders until the
-- client sends operating numbers"; the admin edits them). The window, cut-offs, horizon
-- and complaint window are the sprint plan's; the minimum order and delivery fee are 0
-- (no price is invented), the capacity 40 orders and 10 carcasses a day, and cash on
-- delivery is on for every order type but the Adha sacrifice, with no cap, confirmed by
-- an admin.
INSERT INTO "operations_settings" (
  "delivery_window_start", "delivery_window_end", "cutoffs",
  "default_orders_per_day", "default_carcasses_per_day",
  "cod_enabled", "cod_max_order_halalas", "cod_allowed_order_types", "cod_confirmation",
  "booking_horizon_days", "min_order_halalas", "delivery_fee_halalas",
  "complaint_window_hours", "closed_days", "updated_at")
VALUES (
  '16:00', '22:00',
  '{"readyMeat":{"time":"12:00","leadDays":0},"carcass":{"time":"20:00","leadDays":1},"cooked":{"time":"18:00","leadDays":1},"occasion":{"time":null,"leadDays":3},"adha":{"time":null,"leadDays":3}}',
  40, 10,
  true, NULL, ARRAY['ready_meat', 'carcass', 'cooked', 'occasion', 'mixed'], 'review',
  14, 0, 0,
  48, '[]', CURRENT_TIMESTAMP);
