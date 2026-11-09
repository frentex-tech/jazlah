# ADR-0001: Technology stack

- **Status:** accepted
- **Date:** 2026-11-09

## Context
Jazlah needs a customer mobile app, a customer website, and admin, vendor and kitchen dashboards, backed by one API. Two developers will build it. The client approved the stack (decisions 38–40).

## Decision
- Mobile: **Flutter** (one codebase for iOS and Android, strong RTL support)
- Web and dashboards: **Next.js** (SSR for SEO on the customer site; one dashboard app with role-based areas)
- Backend: **NestJS** (TypeScript, modular), **PostgreSQL + PostGIS** (coverage polygons), **Redis** (cache and queues)
- Realtime: WebSockets. Push: Firebase Cloud Messaging. Files: S3-compatible storage
- Monorepo in this repository; every external provider sits behind an adapter interface

## Consequences
TypeScript is shared across the API, web and dashboards. Flutter needs its own client, generated from the OpenAPI spec. No POS integration at launch (decision 43).
