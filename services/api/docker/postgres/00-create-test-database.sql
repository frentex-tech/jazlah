-- Runs once, when the database volume is first created (docker-compose.yml).
-- The development database `jazla` is created by the image from POSTGRES_DB.
-- PostGIS itself is enabled by the first Prisma migration in each database.
CREATE DATABASE jazla_test OWNER jazla;
