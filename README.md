# Jazlah · جزلة

Multi-vendor meat & livestock platform for Saudi Arabia (Riyadh, Taif and nearby cities).
Jazlah sells its own products, and partner butchers and slaughterhouses list theirs on the platform. It also offers occasion sacrifices, farm visits, cooking through contracted kitchens, an Eid al-Adha season mode and a feed marketplace.

> Built by **Frentex Tech**. Source of truth for scope: [SRS v1.0](docs/srs/Jazlah-SRS-v1.0.pdf) · [Requirements index](docs/requirements.md) · [Approved decisions](docs/decisions/Jazlah-Decisions.png)

## Start here

- New to the project, or a Claude Code session? Read [CLAUDE.md](CLAUDE.md) → [docs/delivery/STATUS.md](docs/delivery/STATUS.md) → the current sprint file.

## Repository layout

| Path | What | Stack |
|---|---|---|
| [`apps/mobile`](apps/mobile) | Customer app (iOS / Android) | Flutter |
| [`apps/web`](apps/web) | Customer website | Next.js |
| [`apps/dashboard`](apps/dashboard) | Admin, vendor and kitchen dashboards (role-based) | Next.js |
| [`services/api`](services/api) | Backend API, jobs, webhooks, realtime | NestJS · PostgreSQL/PostGIS · Redis |
| [`infra`](infra) | Environments, deployment, monitoring | Docker · Saudi-region cloud |
| [`docs`](docs) | SRS, requirements index, decisions, ADRs | — |

## How we work

- **Board:** GitHub Project *Jazlah — Delivery Board* (Backlog → Todo → In Progress → In Review → QA → Done).
- **Sprints:** 7 milestones (`Sprint 1` … `Sprint 7` → v1.0.0), then `Post-launch`. Full plan in [docs/delivery](docs/delivery/README.md).
- **Progress:** live dashboard at https://frentex-tech.github.io/jazlah/ (auto-updated).
- **Hierarchy:** every module is an **Epic** issue. Its work is split into **sub-issues**, one per layer (API, mobile, web, dashboard, design, QA).
- **Traceability:** every issue cites the SRS requirement IDs it implements (for example `FR-SCH-03`).
- **Branching, commits, PRs, merge rules and Definition of Done:** see [CONTRIBUTING.md](CONTRIBUTING.md).

## Launch scope vs post-launch

Launch: accounts, coverage, catalog & customization, cart, scheduling, payments, orders, delivery-company integration, notifications, dashboards, finance, occasions, farm visits, kitchens, Eid al-Adha, freshness, feed marketplace, ZATCA e-invoicing.

Post-launch: loyalty points, stories, Sahm Al-Khair, installments, multiple daily slots, reorder & gifting, favorites, verified badge, seasonal theme, paid feed transactions, vendor staff accounts.

---
© Frentex Tech. Private and confidential.
