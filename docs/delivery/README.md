# Delivery plan — source of truth

This folder is the full plan for building Jazlah, from the first commit to the store release. Every Epic and task on the GitHub board is **generated from the files here** by [`tools/backlog/sync.py`](../../tools/backlog/sync.py). Run `python3 tools/backlog/backlog.py` to validate the plan (unknown requirements, broken or forward dependencies, cycles, uncovered SRS requirements). To change the plan, edit these files and re-run the sync. Never edit only on GitHub.

Lost mid-project? Start with [`STATUS.md`](STATUS.md), then the current sprint file, then the code paths named in its tasks.

| File | What it holds |
|---|---|
| [STATUS.md](STATUS.md) | Live progress log: what is done, in progress and blocked, plus decisions made during the build. **Update it at the end of every sprint and at every major merge.** |
| [integration-plan.md](integration-plan.md) | How work flows between API, web, mobile and dashboards; merge points per sprint; release and build cadence |
| [sprints/sprint-1.md](sprints/sprint-1.md) … [sprint-7.md](sprints/sprint-7.md) | Launch scope, sprint by sprint |
| [sprints/post-launch.md](sprints/post-launch.md) | Phase 2 features |
| [board.md](board.md) | How to read the board and the progress dashboard (for management) |
| [issue-map.json](issue-map.json) | Generated: task key → GitHub issue number (do not edit by hand) |
| [../architecture.md](../architecture.md) | Code map and conventions every task refers to |
| [../requirements.md](../requirements.md) | SRS requirement IDs |

## Sprint overview

| Sprint | Theme | Release |
|---|---|---|
| 1 | Foundation (monorepo, CI, staging, API core, app scaffolds, design system) + accounts (OTP), addresses, coverage zones | v0.1.0 |
| 2 | Vendor onboarding, catalog & product customization, storefront (home, stores, product, search) | v0.2.0 |
| 3 | Cart & coupons, scheduling engine & operations settings, checkout, payments (port + gateway), orders, wallet ledger | v0.3.0 (first E2E order demo) |
| 4 | Live gateway in clients, cancellation & complaints, delivery-company integration, notifications, vendor live board & freshness, admin core, finance & payouts | v0.4.0 |
| 5 | Occasions, kitchens (cooking), Eid al-Adha season, production environment provisioned | v0.5.0 |
| 6 | Farm visits, feed marketplace & chat, ratings, marketing content & legal pages, ZATCA e-invoicing | v0.6.0 (feature freeze) |
| 7 | Production, security, performance, observability, UAT, store submission | **v1.0.0** |
| Post-launch | Loyalty, stories, Sahm Al-Khair, installments, multi-slot, reorder/gift/favorites, verified badge & seasonal theme, paid feed transactions, vendor staff | v1.x |

There are no dates and no assignees on purpose. Pick tasks from the current sprint's **Todo** column and assign yourself when you start, so the progress dashboard credits the work.

## Task file format (what the sync script parses)

```markdown
## EPIC KEY — Epic title
- reqs: FR-XXX-01, FR-XXX-02
Free text summary of the epic.

### KEY-AREA-N — Task title
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-XXX-01 · depends: OTHER-API-1 · labels: needs-client`

**What:** exactly what to build.
**Output:** the concrete artefacts (endpoints, screens, tables, files).
**How:** implementation steps and technical notes.
**Where:** repo paths.
**Acceptance:**
- [ ] verifiable criteria
```

- **Keys:** `<EPIC>-<AREA>-<n>`, where AREA is `API`, `MOB` (mobile), `WEB`, `DSH` (dashboard), `DES` (design), `INF` (infra), `QA` or `DOC`.
- **type:** `Feature` (user-facing) or `Task` (technical). Epics use the `Epic` issue type.
- **size:** `XS` ≤ half a day · `S` ≈ 1 day · `M` 2–3 days · `L` 4–5 days · `XL` ≈ 1–2 weeks. Large tasks list their sub-parts in italics inside **Output/How**. Tick them in the issue as you go, and split into child issues only if two people work on it.
- **prio:** `P0` (launch blocker) · `P1` (needed for launch, can slip within the sprint) · `P2` (nice to have).
- **depends:** task keys that must be **merged into `develop`** first. The sync turns them into issue links.
- **labels:** `needs-client` (waiting on a client decision or input), `spike` (research, its output is a decision recorded as an ADR), `security`.

Every task also follows the shared rules in [CONTRIBUTING.md](../../CONTRIBUTING.md): branch `feature/<issue>-<slug>` from `develop`, PR back to `develop`, and the Definition of Done.
