# JAZLA — API

NestJS 12 (CommonJS) and TypeScript 6 on Node 26, standalone (pnpm, no workspace), with PostgreSQL 17 + PostGIS through Prisma 7, and Redis 7 with BullMQ 6 for background jobs. Later steps add the integrations (mail, SMS, push, payments through Geidea, storage, delivery, ZATCA, BNPL), each behind a port with one provider per vendor.

```
pnpm install
cp .env.example .env     # first time only
pnpm db:generate         # the Prisma client (not committed)
pnpm infra:up            # Docker: PostgreSQL + PostGIS (host port 5434) and Redis (6380)
pnpm db:deploy           # apply migrations
pnpm start:dev           # GET http://localhost:3000/v1/health, /v1/health/ready; Swagger at /docs
pnpm openapi:generate    # after an endpoint or DTO change: rewrites openapi.json (commit it)
pnpm lint && pnpm lint:rules && pnpm openapi:check && pnpm build && pnpm test && pnpm test:types && pnpm test:e2e
```

Layout and conventions: [`.claude/ARCHITECTURE.md`](.claude/ARCHITECTURE.md). Working rules for Claude Code sessions: [`CLAUDE.md`](CLAUDE.md).
