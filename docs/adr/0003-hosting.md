# ADR-0003: Hosting (staging now, production in a Saudi region)

- **Status:** accepted
- **Date:** 2026-11-22
- **Decided by:** the owner, with the client's agreement (2026-11-22)

## Context
NFR-HST asks for the data to be hosted in Saudi Arabia on a cloud with a Saudi region. NFR-AVL asks for 99.5 % availability and daily database backups kept for 30 days, with a written restore plan. The stack (ADR-0001) needs PostgreSQL with PostGIS, Redis, S3-compatible object storage and a container runtime for the API (`services/api/Dockerfile`) and the dashboard (`apps/dashboard/Dockerfile`).

Staging had to run before any paid account existed. The decision to run it on free tiers is in `docs/delivery/STATUS.md` (2026-11-21).

## Decision

### Staging: free tiers in Frankfurt (live)
- **Render Free** web services: `jazla-api-staging` and `jazla-dashboard-staging`, on `*.onrender.com` addresses. There is no domain and no DNS change.
- **Neon** free PostgreSQL with PostGIS, and **Upstash** free Redis with TLS, both in Frankfurt.
- Each merge to `develop` deploys after CI passes. The setup, rollback and limits are in `docs/deploy/render-staging.md`. The Neon and Upstash choice and the Redis command budget are in `services/api/.claude/DECISIONS.md`, under "Staging database and Redis outside Render".
- Staging holds no real data and has no backups. It stays in Frankfurt until production is set up. Then it moves to the production provider as a smaller copy.

### Production: Google Cloud, Dammam region (`me-central2`)

| | Google Cloud, Dammam (**chosen**) | Oracle Cloud, Jeddah / Riyadh | STC Cloud (center3) |
|---|---|---|---|
| Containers | Cloud Run, which scales on demand and is close to how Render runs the images | Container Instances (no autoscaling) or OKE (Kubernetes, more to run) | Kubernetes or VMs, depending on the package |
| PostgreSQL + PostGIS | Cloud SQL, with PostGIS, high availability, automated daily backups and point-in-time recovery | OCI Database with PostgreSQL. PostGIS support must be checked at setup | Managed PostgreSQL depends on the package. PostGIS and PITR must be checked |
| Redis | Memorystore for Redis (or Valkey) | OCI Cache (Redis and Valkey) | Depends on the package |
| Object storage | Cloud Storage, which speaks the S3 API with HMAC keys, so the existing `s3` storage provider works | Object Storage, with an S3-compatible API | S3-compatible storage depends on the package |
| Second region in the Kingdom | No | Yes: Jeddah and Riyadh, for disaster recovery inside the Kingdom | Several local data centres |
| How the client buys | Through **CNTXT**, Google's exclusive reseller in the Kingdom, required for a Saudi billing address | Directly from Oracle | Through a sales contract |
| Licence | CST Class C licence in Dammam | Local regions | Local provider |
| **Approximate production cost** | **≈ $350–550 a month** | ≈ $250–450 a month | Quote only |

**What the Google Cloud estimate covers:**
- **API on Cloud Run:** at least 1 instance always on. About $60–120.
- **Dashboard on Cloud Run.** About $20–40.
- **Cloud SQL:** 2 vCPU, 8 GB, high availability, with backups. About $200–300.
- **Memorystore:** 1 GB, standard tier. About $50–90.
- **Storage, load balancer and egress.** About $20–40.

A production-shaped staging on the same provider would cost about $60–120 a month. None of these prices are quotes. They come from public list prices, rounded. The real figure comes from CNTXT's quote and the provider's calculator when the account is opened, and it may differ by ±30 %.

**Why Google Cloud:**
- It covers every managed service the stack needs in one Saudi region: containers that scale, PostgreSQL with PostGIS and PITR, Redis, and S3-compatible storage.
- The app already depends on Google for Firebase (push) and Google Maps, so the client has one vendor and one billing relationship.
- Cloud Run runs the same Docker images as staging, so moving is a configuration change and not a rewrite.
- Cloud SQL's automated backups and PITR cover NFR-AVL's daily backups with 30 days of retention.

Oracle is the fallback if CNTXT's terms or price do not suit the client. It is cheaper and has two regions in the Kingdom, but it has no Cloud Run equivalent, and its PostGIS support must be checked first.

### External accounts
Every account belongs to the client, and Frentex is added as admin or developer. The list, with an owner and a status for each account, is in `docs/accounts.md`. It does not hold any secrets.

## Consequences
- **Production setup starts once the client opens the CNTXT account.** That work is FND-INF-5 / HRD-INF-1, and the domain is #138. Until then, staging stays on the free tiers, with their limits: sleeping services, no backups and no background queues.
- **Nothing in the code is tied to one provider.** The images and storage are S3-compatible, and the settings come from the environment. Moving to production is a matter of configuration and data migration.
- **Payments and SMS are built against a fake or sandbox provider behind their ports** until the client's keys arrive. See `docs/delivery/STATUS.md`.
- **The 99.5 % target needs production on paid tiers.** Staging on free tiers does not meet it and does not try to.
