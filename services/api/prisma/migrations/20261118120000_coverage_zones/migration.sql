-- The coverage module (issue #24): delivery zones as PostGIS polygons. PostGIS itself is
-- enabled by the init migration.

-- CreateTable
CREATE TABLE "coverage_zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "polygon" geometry(Polygon, 4326) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT '#6A1A20',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "coverage_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coverage_zones_polygon_idx" ON "coverage_zones" USING GIST ("polygon");

-- CreateIndex
CREATE INDEX "coverage_zones_created_at_id_idx" ON "coverage_zones"("created_at", "id");

-- Added by hand: a zone's polygon is always valid (no self-intersection, closed rings).
-- The coverage module checks first and answers INVALID_POLYGON; this is the backstop.
ALTER TABLE "coverage_zones" ADD CONSTRAINT "coverage_zones_polygon_check"
  CHECK (ST_IsValid("polygon"));

-- Added by hand: the map colour is `#RRGGBB` (the API validates it first).
ALTER TABLE "coverage_zones" ADD CONSTRAINT "coverage_zones_color_check"
  CHECK ("color" ~ '^#[0-9A-Fa-f]{6}$');
