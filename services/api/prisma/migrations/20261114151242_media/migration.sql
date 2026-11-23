-- CreateEnum
CREATE TYPE "media_visibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "media_status" AS ENUM ('pending', 'ready', 'rejected');

-- CreateEnum
CREATE TYPE "media_rejection_reason" AS ENUM ('OBJECT_MISSING', 'EMPTY_FILE', 'TOO_LARGE', 'TYPE_NOT_ALLOWED', 'CONTENT_TYPE_MISMATCH', 'EXPIRED');

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purpose" TEXT NOT NULL,
    "visibility" "media_visibility" NOT NULL,
    "bucket" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "status" "media_status" NOT NULL DEFAULT 'pending',
    "size_bytes" INTEGER,
    "detected_content_type" TEXT,
    "original_file_name" TEXT,
    "owner_id" UUID,
    "rejection_reason" "media_rejection_reason",
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "confirmed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_status_expires_at_idx" ON "media"("status", "expires_at");

-- CreateIndex
CREATE INDEX "media_owner_id_idx" ON "media"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_bucket_object_key_key" ON "media"("bucket", "object_key");
