# Jazlah — Project status log

> Living document. Update it at the end of every sprint (in the release PR) and whenever a decision changes the plan. Newest entries first. A fresh Claude Code session reads this file first.

## Current state

| Item | Value |
|---|---|
| Phase | **Planning done, Sprint 1 not started** |
| Current sprint | Sprint 1 — Foundation, accounts & coverage |
| Last release | — |
| Scope baseline | SRS v1.0 (approved 2026-11-09), 44 client decisions (`docs/decisions/`) |
| Team | Abdulrhman Magdy (`@abdulrhmanmagdy1`), Kerolles Sobhy (`@kerolles2003`) |
| Board | GitHub Project "Jazlah — Delivery Board" (org `frentex-tech`). Repo + board are **public** for now (decided 2026-11-09), to be made private later on request |

## Waiting on the client

| Input | Blocks | Status |
|---|---|---|
| Payment gateway choice + sandbox keys | PAY-API-2 (Sprint 3) | Owner's decision 2026-11-22: build against a fake/sandbox provider behind a payments port (created with PAY-API-2) until the keys arrive |
| SMS provider + sender ID | ACC-API-1 production SMS | Owner's decision 2026-11-22: the `log` provider behind the SMS port on staging until the keys arrive |
| Delivery company API docs + sandbox | DLV-API-2 (Sprint 4) | open |
| Operating numbers (cutoffs, capacity, fees, minimum order, COD cap, deposit %) | none (editable settings) | open |
| Hosting approval (ADR-0003) and third-party accounts | FND-INF-4, FND-INF-5 | Owner's decision 2026-11-22 (client agrees): ADR-0003 accepted. The accounts are tracked in `docs/accounts.md` |
| Jazlah brand assets (logo, palette) | DSN-DES-1 | open |
| ZATCA onboarding + seller-of-record confirmation | INV-API-2 (Sprint 6) | Owner's decision 2026-11-22: ADR-0006 accepted (Jazlah is the seller of record; direct integration). VAT number, Fatoora access and the accountant's check are still needed before production |
| Installment provider (Tamara/Tabby) | post-launch | open |

## Decisions taken during planning (not in the SRS text)

- **Jazlah is vendor #1** (`isPlatform=true`), so one code path serves Jazlah and partner products and orders.
- **Daily capacity** is counted **per vendor** from a platform default, with admin overrides per vendor or date.
- **Commission base:** items subtotal net of VAT, after vendor-scoped discounts (net of VAT since ADR-0006, 2026-11-22). The delivery fee and platform-wide coupons belong to Jazlah.
- **Guest cart merge:** if the vendors differ, the guest cart replaces the server cart.
- **Dashboards** use phone OTP for staff (`audience=staff`), with no self-signup except the vendor application.
- **Chat** allows phone numbers at launch (feed deals close off-platform), behind a setting.
- **Feed buyers** are registered platform users. Feed sellers need admin approval.

## Log

### 2026-11-22 — Hosting and ZATCA decided; staging closed (owner)
- **#8 closed:** staging was checked live on Render (see the last comment on #8).
- **ADR-0003 accepted** (client agrees). Staging stays on free tiers in Frankfurt. Production goes to Google Cloud Dammam through CNTXT, with Oracle as the fallback. The external accounts are listed in `docs/accounts.md`.
- **ADR-0006 accepted.** Jazlah is the seller of record for every order, with one invoice per order. The integration with ZATCA is direct, behind `integrations/zatca`.
- **Payments and SMS** are built against fake or sandbox providers behind their ports until the client's keys arrive.

### 2026-11-21 — The core team takes over the API and staging (owner)
- **Kerolles is paused** on Jazlah for now. The core team builds the API and staging itself, in its own sessions, on Kerolles' structure and conventions (`services/api/CLAUDE.md`, `.claude/DECISIONS.md`, the patterns of #228–#244). No rewrite: same modules, ports, Prisma migrations, error codes and e2e on a fresh DB.
- **Order:** (A) the Sprint 2 API gaps from the lead review (incompatible pairs, server `PricingService`, public product availability, review queue, permission code, flaky logging test) so the Sprint 2 screens get wired and their issues close; (B) Sprint 3 API in the MP-1 order, each contract merged first so the clients use the generated client.
- **Staging on free tiers first:** Kerolles' Render blueprint (#246) is taken over and run on free instance types with `*.onrender.com` addresses (no domain or DNS change); paid plans and the Saudi-region decision (#7, `needs-client`) come later.
- **Closing rule while staging is not up:** a screen issue closes when it runs on the real API with an e2e test green in CI; a staging smoke check follows once staging is live.
- For Kerolles when he returns: this entry, the PR list, and each decision recorded in `services/api/.claude/DECISIONS.md`.

### 2026-11-21 — Sprint 2 UI built and reviewed; Sprint 3 UI starts
- **Sprint 2 UI is merged:** mobile #276 #277 #278 (+ review fixes #282), dashboard #275 #279 #280 #281 (+ review fixes #283). Design QA and a lead review ran; all frontend findings are fixed except those waiting on the API. #45 #46 #51 #52 #55 #56 #57 stay open (`Refs`) until each screen is verified on the real API / staging.
- Most Sprint 2 screens already use the generated client (the vendor and catalog endpoints were in `openapi.json`); the dashboard has e2e tests for all four flows against the real API.
- **Waiting on the API:** incompatible cut × packaging rules are global and block publishing, and the public product doesn't carry them, so the Sprint 2 exit demo "one incompatible combination blocked in the app" is not yet possible; pricing interface and error codes; public product availability / per-size stock / non-null size ids; review-queue support; a distinct permission-denied code; the flaky `logging.e2e-spec.ts`. Sent to the API owner.
- Sprint 3 design specs exported: `docs/design/spec/sprint-3.txt` (61 screens and states). CRT-DSH-1 (coupons) has no Figma frame; it is built from the design system and recorded in `docs/design/signoff.md`.

### 2026-11-20 — Frontend runs ahead of the API (owner)
- **The client approved the full design** (DSN-DES-2 #204 closed).
- **UI first, on mocks:** the app and dashboard build the screens of Sprints 2, 3, 4 … ahead of the API, one sprint at a time (build → design QA + lead review → fixes → next sprint). Kerolles builds the API in parallel. Mocks follow the shapes in the sprint file (or a merged `openapi.json` contract) and sit behind the repository/backend interface, listed in `docs/frontend/not-built-yet.md`.
- A screen PR built on mocks says `Refs #N`; the issue closes with the PR that wires it to the real API.
- Sprint 2 design specs exported: `docs/design/spec/sprint-2.txt` (102 screens and states).

### 2026-11-18 — Scope decisions by the owner (Abdulrhman)
- **No customer website.** Customers use the mobile app only. The 13 `*-WEB-*` feature tasks were removed from the sprints and kept in `docs/delivery/archive/web-tasks-2026-11-18.md`; `APP-WEB-1` is now the Tailwind preset for the dashboard and `HRD-WEB-1` the dashboard and public-page readiness. `apps/web` is not to be built.
- **One public page on the domain** (download the app, join as a vendor): `CMS-DSH-2`, Sprint 6, inside the dashboard app.
- **Loyalty points, stories and Sahm Al-Khair are in the launch scope.** Epics LOY, STY and CHR moved from post-launch to Sprint 6. They were placed there because their dependencies land in Sprints 3 and 4; the sprint was not re-sized. Their design was done on 2026-11-13.
- **Vendor applicants are answered by email** (received, approved, rejected); SMS is for the sign-in code plus one SMS on approval: `NOT-API-2`, Sprint 4. The API has no mail integration yet.
- **Latin brand name: JAZLA**, as written in the client's logo. The repo, package and file names still say Jazlah and were not renamed.
- **Verification codes are 6 digits** (the API default, `AUTH_OTP_LENGTH=6`), for customers and staff (owner, 2026-11-18). Figma draws 4 cells; the apps show 6 and that is an accepted difference from the design.
- **Build fonts: Readex Pro and El Messiri for now, in the app and the dashboard.** Figma stays in Thmanyah. Thmanyah is not bundled until its licence is checked at the end of the build; `docs/design/tokens.json` holds both (`family` = build, `designFamily` = Figma). Design QA compares size, weight and line height, not the font family.
- The plan is 150 tasks after this change (161 before). `tools/backlog/sync.py` was run on 2026-11-18 (new issues: NOT-API-2 #252, CMS-DSH-2 #253), and the 13 removed web issues (#21, #27, #58, #59, #65, #72, #86, #87, #95, #102, #135, #153, #171) were closed as not planned.

### 2026-11-09 — Planning
- Repo `frentex-tech/jazlah` created (private), `main` + `develop` (default), merge rules and PR policy check.
- Delivery plan written in `docs/delivery/` (7 sprints + post-launch). Board, milestones, epics, tasks, sub-issues and dependencies generated by `tools/backlog/sync.py`.
- Progress dashboard issue and its daily workflow added.
- Note: the bootstrap commits were pushed directly to `main` and `develop` before the branching rules took effect. From Sprint 1 on, everything goes through PRs.
