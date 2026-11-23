-- Uploads go to a staging key in the private bucket; confirmation copies the object to
-- a final key no upload ticket names, checks that copy, and only then marks the row
-- ready. So the final location is known only once the row is ready.

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "staging_key" TEXT,
ALTER COLUMN "bucket" DROP NOT NULL,
ALTER COLUMN "object_key" DROP NOT NULL;

-- Hand-written (Prisma cannot express a check constraint): a ready row always has the
-- location of its checked copy.
ALTER TABLE "media" ADD CONSTRAINT "media_ready_location_check"
  CHECK ("status" <> 'ready' OR ("bucket" IS NOT NULL AND "object_key" IS NOT NULL));
