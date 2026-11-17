// Configuration of the Prisma CLI (Prisma 7). The running API does not read this file:
// it connects through PrismaService with the validated DATABASE_URL.
//
// Prisma 7 does not load `.env` by itself. dotenv loads it here without overriding
// variables already set, so `scripts/e2e.mjs` can point the CLI at the test database.
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ quiet: true });

export default defineConfig({
  // A folder: prisma/schema.prisma (generator, datasource) and one file per domain in prisma/models/.
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
    // `prisma db seed` runs the same script as `pnpm db:seed`. Prisma 7 runs it only on
    // that explicit command, never after `migrate dev` or `migrate reset`.
    seed: 'node -r ts-node/register/transpile-only -r tsconfig-paths/register prisma/seed/seed.ts',
  },
  datasource: {
    // Read directly rather than through env(), which throws when the variable is unset:
    // `prisma generate` needs no database, so it must work without DATABASE_URL.
    url: process.env.DATABASE_URL ?? '',
    // An empty database Prisma may wipe, for `pnpm db:drift` (and `migrate dev` when set):
    // it replays the migrations there and compares the result with the schema. CI points
    // it at a database of its Postgres service. Unset, `migrate dev` makes its own.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
