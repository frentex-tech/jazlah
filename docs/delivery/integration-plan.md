# Integration & merge plan

How work from the API, mobile, web and dashboards meets, and when it merges.

## 1. Where each kind of work lives

| Work | Folder | Deploys to | Commit scope |
|---|---|---|---|
| Backend endpoints, jobs, webhooks, realtime | `services/api` | API staging/prod | `api` |
| Customer app (iOS/Android) | `apps/mobile` | Firebase App Distribution → TestFlight / Play | `mobile` |
| Customer website | `apps/web` | Web staging/prod | `web` |
| Admin / vendor / kitchen dashboards | `apps/dashboard` | Dashboard staging/prod | `dashboard` |
| Generated TS client | `packages/api-client` | (library) | `api` |
| Local env, CI, deploy | `infra`, `.github/workflows` | — | `infra` / `ci` |
| Designs | Figma (link in each DES task), exports in `docs/design/` | — | `docs` |

## 2. Order inside every epic

```
DES (screens) ─┐
               ├─► API task merged to develop (contract = Swagger)
               │        │ regenerate api-client (TS + Dart)
               │        ├─► DSH task (admin/vendor/kitchen side)  ─┐
               └────────┼─► MOB task                                ├─► QA task / epic demo on staging
                        └─► WEB task                               ─┘
```

- **API first.** Client tasks list their API task under `depends`. They may start early against a Prism mock of the API PR's spec, but they **merge after** it.
- **Dashboard before customer** when the customer feature needs data someone must enter first. For example, products need admin product management, and checkout days need operations settings.
- **Design-first:** the whole launch design is produced and signed off by the client in Sprint 1 (DSN-DES-2). Front-end tasks implement approved screens; design changes after sign-off go through the change log.

## 3. Merge points per sprint

Every sprint follows the same rhythm:

| Point | What merges | Gate |
|---|---|---|
| **MP-1: contracts** (first third of the sprint) | All of the sprint's API tasks that clients depend on | Swagger reviewed by the other dev; api-client regenerated |
| **MP-2: features** (continuous) | Client tasks, each its own `feature/*` PR into `develop` | PR policy green, 1 approval, CI green |
| **MP-3: freeze** (last days) | Branch `release/v0.N.0` from `develop`. Only `fix/*` PRs into it from here | Exit criteria of the sprint file demoed on staging |
| **MP-4: release** | PR `release/v0.N.0` → `main` (merge commit), tag `v0.N.0`, then PR `main` → `develop` | All sprint P0 tasks Done; STATUS.md updated |

Sprint-specific merge notes are listed at the top of each sprint file under **Merge points**.

## 4. Cross-sprint dependencies (critical path)

```
S1 foundation + accounts + coverage
   └─► S2 vendors + catalog + storefront
          └─► S3 cart + scheduling + checkout + payments + orders + wallet
                 ├─► S4 after-sales + delivery + notifications + vendor board + admin + finance
                 │      └─► S5 occasions + kitchens + Adha (+ production env)   (needs payments S3, shipments S4)
                 └─► S6 visits + feed + chat + ratings + CMS + ZATCA   (needs S4 finance/notifications, S5 occasions)
                              └─► S7 hardening + UAT + launch
```
Inside S5, occasions depend on kitchens (cooking option). Adha is independent. In S6, visits, feed/chat and ZATCA are independent tracks.

**Tax decision early:** INV-DOC-1 (seller of record, VAT on deposits) sits in Sprint 1 because it shapes the order and finance data model built in Sprints 3–4.
## 5. Client inputs that block tasks (`needs-client`)

| Input | Blocks | Fallback while waiting |
|---|---|---|
| Payment gateway choice (Moyasar / Tap / HyperPay / PayTabs) and its sandbox keys | PAY-API-2 (S3), PAY-MOB-2 (S4) | Clients and orders work against the fake provider; the port is fixed |
| SMS provider plus sender ID | ACC-API-1 production SMS (S1) | Console/log SMS provider in dev and staging, with a fixed OTP on staging |
| Delivery company API docs and sandbox | DLV-API-2 (S4) | Manual courier flow (DLV-API-1 manual adapter) works without it |
| Operating numbers (cutoffs, capacity, fees, minimum order, COD cap, deposit %) | None (all are settings) | Seed defaults, client edits them in the dashboard |
| Hosting approval (ADR-0003) | FND-INF-5 staging (S1) | Run staging temporarily on a low-cost provider and migrate when approved. Everything is containerised |
| Seller of record & VAT on deposits (accountant) | INV-DOC-1 (S1) → order/finance model | Assume Jazlah is the seller of record for all orders (simplest) and keep vendor VAT fields optional |
| Installment provider (Tamara / Tabby) | Post-launch | — |
| ZATCA onboarding (CSID) under the client's VAT number | INV-API-2 (S6) | Sandbox (developer portal) |

## 6. Builds and releases

- **API, web and dashboard:** every push to `develop` deploys to staging. Every tag `vX.Y.Z` on `main` deploys to production.
- **Mobile:** each `release/*` branch builds the `staging` flavor and sends it to Firebase App Distribution for the team and the client. Tags build the `prod` flavor for TestFlight and Play internal testing. The store submission happens in Sprint 7.
- **Version scheme:** `v0.N.0` at the end of sprint N, then `v1.0.0` for the store launch. Mobile build number = CI run number.
