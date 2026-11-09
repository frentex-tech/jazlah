# Sprint 7 — Hardening, UAT & store launch

> **Goal:** production-grade quality and the public launch. Production environment, security, performance under seasonal peaks, observability, backups, full regression, client UAT, legal/privacy, and App Store / Google Play release.

**Release:** **v1.0.0**

**Exit criteria:**
- Production is live on a Saudi-region host with backups verified by a restore drill, monitoring and alerts.
- Load test: p95 API latency < 500 ms at the expected peak, and the Adha scenario (10× normal) without errors.
- Security review done: no open high or critical findings.
- The client signed off UAT. The apps are approved on the App Store and Google Play, and the web and dashboards are live on production domains.

**Merge points:**
- No new features in this sprint. Every change is a `fix/*`, `perf/*`, `chore/*` or `docs/*` PR into `develop`, or into `release/v1.0.0` once it's cut.
- Cut `release/v1.0.0` after HRD-QA-1 and HRD-API-1 are done. Production (HRD-INF-1) was provisioned in Sprint 5. UAT (HRD-QA-2) runs on the release branch build.
- MP-4: REL-INF-7, the launch.

**Parallel tracks:** DevOps: HRD-INF-2, HRD-INF-3 · Backend: HRD-API-1 · QA: HRD-QA-* · Mobile: HRD-MOB-1 · Web: HRD-WEB-1 · Docs/legal: HRD-DOC-1

## EPIC HRD — Hardening & launch
- reqs: NFR-PER, NFR-AVL, NFR-SEC, NFR-PRV, NFR-HST, NFR-CMP, NFR-USB, NFR-OBS, NFR-STR
Everything between "feature complete" and "live in the stores".

### HRD-INF-2 — Observability, backups & disaster recovery
`type: Task · area: infra · size: M · prio: P0 · reqs: NFR-OBS, NFR-AVL · depends: HRD-INF-1`

**What:** know when something breaks, and be able to recover.

**Output:** Sentry for API, web, dashboard and Flutter (with releases and source maps), Firebase Crashlytics, centralized structured logs with request ids, uptime checks for health endpoints, alerts (5xx rate, p95 latency, queue backlog and DLQ size, payment/delivery webhook failures, ZATCA rejections, disk/DB connections) to the team's channel; daily DB backups with 30-day retention plus PITR where available, object storage versioning; `docs/runbooks/restore.md` and `docs/runbooks/incidents.md`; **one restore drill into a scratch environment**

**Where:** `services/api/src/common/observability/`, `docs/runbooks/`, `infra/deploy/`

**Acceptance:**
- [ ] The restore drill is documented with its date and the time it took
- [ ] A forced API error appears in Sentry and fires an alert

### HRD-API-1 — Security review & hardening
`type: Task · area: api · size: L · prio: P0 · reqs: NFR-SEC, NFR-PRV · depends: ADM-API-1, REL-INF-6 · labels: security`

**What:** close security gaps before real money and data flow.

**Output:** an OWASP ASVS L1-based checklist in `docs/security/review.md` with results; rate limits on all public and auth endpoints; CSP/HSTS on web and dashboard; PII encryption at rest verified (IBAN, documents private); authorization matrix e2e (customer/vendor/kitchen/admin × all endpoints, IDOR checks on every `:id` route); webhook signature tests; dependency audit (`pnpm audit`, `dart pub outdated`), secret scanning enabled on the repo, secrets rotated from staging values; an external or Strix-assisted pentest of staging, with the findings fixed

**Where:** `services/api/test/security/`, `docs/security/`

**Acceptance:**
- [ ] No open high or critical findings; the IDOR suite passes for every resource

### HRD-QA-1 — Performance & peak-load testing
`type: Task · area: qa · size: M · prio: P0 · reqs: NFR-PER, NFR-SCL · depends: HRD-INF-1`

**What:** prove the platform handles normal peaks and Eid al-Adha.

**Output:** k6 scripts in `tests/load/` (browse home/search/product, checkout days, place order with the fake payment provider, vendor realtime connections, chat); runs against a production-sized environment; a report in `docs/qa/load-test-report.md` with p50/p95/p99, errors and bottlenecks fixed (indexes, caching, N+1 queries, connection pool)

**How:**
- Targets: use the client's expected volumes. Until they're provided, assume a peak of 30 orders/minute and 150 read requests/second (normal), ×10 for the Adha scenario, and record the assumption in the report.

**Where:** `tests/load/`, `docs/qa/`

**Acceptance:**
- [ ] p95 < 500 ms for API reads at the target RPS; the Adha 10× scenario completes with < 0.1% errors

### HRD-QA-2 — Full regression & client UAT
`type: Task · area: qa · size: L · prio: P0 · reqs: NFR-USB, NFR-CMP · depends: HRD-QA-1, REL-INF-6`

**What:** test the whole product the way the client will use it.

**Output:** automated regression (Playwright for web and dashboard critical paths, Flutter `integration_test` for login → order → pay → track) running on release branches; a UAT script per module in `docs/qa/uat/` (customer, vendor, kitchen, admin, finance, feed); UAT sessions with the client on the release build; every finding logged as a `Bug` issue and triaged (launch-blocking or not); written client sign-off stored in `docs/qa/uat/signoff.md`

**Where:** `apps/*/e2e/`, `apps/mobile/integration_test/`, `docs/qa/uat/`

**Acceptance:**
- [ ] All launch-blocking bugs closed; client sign-off recorded

### HRD-DOC-1 — Privacy, terms & PDPL compliance
`type: Task · area: docs · size: S · prio: P0 · reqs: NFR-PRV, NFR-STR, FR-ACC-05 · labels: needs-client`

**What:** the legal pieces the stores and Saudi law require.

**Output:** privacy policy and terms (AR/EN, reviewed by the client's legal adviser) published as static pages (CMS); versioned consent captured at signup and on policy changes (`UserConsent` table + API + app prompt); a data subject request procedure (export/delete) in `docs/runbooks/privacy-requests.md`; App Store privacy labels and the Google Play data-safety form filled in
- A cross-border data transfer assessment (PDPL) for services processing personal data outside the Kingdom (Firebase, Sentry, Google Maps, email/SMS providers), with mitigations

**Where:** `docs/legal/`, `services/api/src/modules/users/`, CMS pages

**Acceptance:**
- [ ] Consent version stored for every new user; policies linked in the apps, web and stores

### HRD-MOB-1 — Mobile polish & store submission
`type: Task · area: mobile · size: L · prio: P0 · reqs: NFR-CMP, NFR-USB, NFR-STR · depends: HRD-QA-2, HRD-DOC-1 · labels: needs-client`

**What:** a polished app, approved in both stores.

**Output:** an accessibility pass (dynamic type, contrast, screen-reader labels, tap targets), a device pass (iOS 14 and Android 8 minimums, small screens, RTL audit), app size and startup time check, Firebase Analytics funnel events (view_item, add_to_cart, begin_checkout, purchase); store listings AR/EN (copy, screenshots, preview), review notes with a demo account, in-app account deletion verified for Apple guideline 5.1.1(v); release `prod` builds through TestFlight and Play internal → production

**Where:** `apps/mobile/`, `docs/store/`

**Acceptance:**
- [ ] Submitted to both stores with complete metadata; every review rejection addressed until approval

### HRD-WEB-1 — Web & dashboard production readiness
`type: Task · area: web · size: M · prio: P1 · reqs: NFR-PER, NFR-CMP · depends: HRD-INF-1`

**What:** fast, indexable, measurable web apps.

**Output:** Core Web Vitals pass (LCP < 2.5 s on 4G for home and product), image optimization through the CDN, final sitemap/robots/OG tags, GA4 or privacy-friendly analytics on the customer web, error pages, a cross-browser check (last 2 versions of Chrome, Safari, Firefox, Edge) for web and dashboard

**Where:** `apps/web/`, `apps/dashboard/`

**Acceptance:**
- [ ] Lighthouse performance ≥ 85 on mobile for home and product pages

### HRD-INF-3 — Go-live runbook & launch
`type: Task · area: infra · size: S · prio: P0 · reqs: NFR-AVL · depends: HRD-INF-2, HRD-MOB-1, HRD-API-1`

**What:** a controlled launch day.

**Output:** `docs/runbooks/go-live.md`: production data seeding (Jazlah catalog, settings with the client's real operating numbers, coverage zones, admin staff), switching providers to live keys (payment, SMS, delivery, ZATCA production CSID), DNS cutover, smoke test checklist (real order with a refund), a rollback plan, a 2-week hypercare rota

**Where:** `docs/runbooks/`

**Acceptance:**
- [ ] A real production order is placed, delivered, invoiced and refunded successfully

## EPIC REL — Releases & merge points

### REL-INF-7 — Release v1.0.0 (launch)
`type: Task · area: infra · size: XS · prio: P0 · depends: HRD-INF-3, HRD-QA-2, HRD-WEB-1`

**What:** the launch release.

**Output:** `release/v1.0.0` → `main`, tag `v1.0.0` (deploys production), back-merge to `develop`, store releases published, GitHub Release notes, STATUS.md marked **Launched** with the post-launch plan

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Production is live, both apps are public, and the client has been notified
