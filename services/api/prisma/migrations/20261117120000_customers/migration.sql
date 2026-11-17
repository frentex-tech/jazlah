-- The customers module (issue #239): profiles, saved addresses and the consent history;
-- users become tombstones when an account is deleted; media owned by a deleted account
-- is removed by the cleanup job.

-- CreateEnum
CREATE TYPE "preferred_language" AS ENUM ('ar', 'en');

-- CreateEnum
CREATE TYPE "consent_kind" AS ENUM ('marketing');

-- CreateEnum
CREATE TYPE "consent_source" AS ENUM ('customer', 'account_deletion');

-- AlterEnum
ALTER TYPE "media_rejection_reason" ADD VALUE 'OWNER_DELETED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "full_name" TEXT,
    "email" TEXT,
    "preferred_language" "preferred_language" NOT NULL DEFAULT 'ar',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "street" TEXT,
    "building" TEXT,
    "short_national_address" TEXT,
    "driver_instructions" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "kind" "consent_kind" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "sequence" INTEGER NOT NULL,
    "source" "consent_source" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_user_id_key" ON "customer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "customer_addresses_user_id_created_at_id_idx" ON "customer_addresses"("user_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "consent_records_user_id_kind_sequence_key" ON "consent_records"("user_id", "kind", "sequence");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Written by hand: a user has a phone exactly while the account exists; a deleted
-- account keeps its row (a tombstone) with no phone, so users_phone_key frees the number.
ALTER TABLE "users" ADD CONSTRAINT "users_deleted_check" CHECK (
  ("deleted_at" IS NULL) = ("phone" IS NOT NULL)
);

-- Written by hand: a full name of 2 to 60 characters; an email stored lowercase.
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_full_name_check" CHECK (
  "full_name" IS NULL OR char_length("full_name") BETWEEN 2 AND 60
);
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_email_check" CHECK (
  "email" IS NULL OR "email" = lower("email")
);

-- Written by hand: at most one default address per customer (the customers module keeps
-- exactly one once any exist, under the lock on the user's row).
CREATE UNIQUE INDEX "customer_addresses_user_id_default_key" ON "customer_addresses"("user_id") WHERE "is_default";

-- Written by hand: coordinates in range.
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_location_check" CHECK (
  "latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180
);

-- Written by hand: a label of 1 to 30 characters; the short national address as four
-- uppercase letters then four digits.
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_text_check" CHECK (
  char_length("label") BETWEEN 1 AND 30
  AND ("short_national_address" IS NULL OR "short_national_address" ~ '^[A-Z]{4}[0-9]{4}$')
);

-- Written by hand: sequences start at 1.
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_sequence_check" CHECK ("sequence" > 0);
