#!/bin/sh
# The API container's start on Render's free plan (no pre-deploy command), run as the
# service's Docker Command `sh scripts/render-start.sh` (docs/deploy/render-staging.md, 3.1).
# 1. The migrations: a failure stops here, the API never starts and Render keeps the
#    previous version.
# 2. The development seed when SEED_ON_START=true (idempotent): a failure is logged and the
#    API starts anyway.
# 3. The API, as PID 1 so it receives Render's SIGTERM.
set -eu

./node_modules/.bin/prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  node dist-seed/prisma/seed/seed.js --allow-staging \
    || echo "Seed failed: the API starts anyway. Read the lines above."
fi

exec node dist/main
