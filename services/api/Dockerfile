# The JAZLA API's production image (staging and production; render.yaml, docs/deploy/).
#
# Build context: services/api/ (`docker build -t jazla-api services/api`).
# Stages:
#   build      every dependency (lockfile frozen, pinned pnpm), the Prisma client, the API
#              (dist/) and the development seed (dist-seed/, run on staging only, by hand)
#   prod-deps  production dependencies only
#   runtime    Node, the compiled code, production dependencies and the migrations, as the
#              non-root `node` user
#
# Migrations are NOT run when a container starts: the deployment runs
# `./node_modules/.bin/prisma migrate deploy` once per deploy, before the new version
# starts (Render's pre-deploy command).

# The major version of .nvmrc (CI reads that file; keep the two in step).
ARG NODE_VERSION=26
# The pnpm version CI pins (.github/workflows/api-ci.yml).
ARG PNPM_VERSION=10.33.2

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
# OpenSSL for Prisma's engines; ca-certificates for TLS to the database, Redis and S3.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g "pnpm@${PNPM_VERSION}"
# No git hooks in an image (.husky/install.mjs also skips without .git).
ENV HUSKY=0
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY .husky/install.mjs .husky/install.mjs
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:generate \
  && pnpm build \
  && pnpm build:seed
# The check CI runs on dist/: no test-only code may reach the image.
RUN found=$(find dist dist-seed \( -name 'testing.*' -o -name 'fake.provider.*' \
    -o -name '*.fake.*' -o -name '*.spec.*' -o -name '*.e2e-spec.*' \) -print) \
  && if [ -n "$found" ]; then echo "Test-only files in the build:"; echo "$found"; exit 1; fi

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
COPY .husky/install.mjs .husky/install.mjs
RUN pnpm install --frozen-lockfile --prod

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/dist-seed ./dist-seed
COPY --chown=node:node package.json prisma.config.ts ./
COPY --chown=node:node prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node prisma/models ./prisma/models
COPY --chown=node:node prisma/migrations ./prisma/migrations
USER node
EXPOSE 3000
# Liveness only (no dependency checked): /v1/health/ready is for the load balancer.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/v1/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "dist/main"]
