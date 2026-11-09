# CLAUDE.md — working on Jazlah

Jazlah (جزلة) is a multi-vendor meat & livestock platform for Saudi Arabia, built by Frentex Tech: a Flutter customer app, a Next.js customer web, a Next.js admin/vendor/kitchen dashboard, and a NestJS API.

## Read first, in this order
1. `docs/delivery/STATUS.md`: where the project is, what's blocked, decisions made during the build
2. `docs/delivery/sprints/sprint-N.md` (the current sprint): every task with What / Output / How / Where / Acceptance
3. `docs/architecture.md`: folder layout and conventions (route prefixes, money in halalas, Riyadh time, contract-first)
4. `CONTRIBUTING.md`: branches, commits, PR rules, Definition of Done
5. `docs/requirements.md`: SRS requirement IDs cited by tasks (the full SRS PDF is in `docs/srs/`)

## Team workflow
Developers use `/task <issue>` (`.claude/commands/task.md`), which delegates to the role agents in `.claude/agents/` and always runs the `reviewer` agent before the PR. See `.claude/WORKFLOW.md`. Keep agent and workflow details out of GitHub issue text.

## When asked to work on a task
- Find it by key (e.g. `SCH-API-2`) in `docs/delivery/sprints/` or by issue number via `docs/delivery/issue-map.json`.
- Check that its **Blocked by** tasks are merged into `develop`. If not, say so before starting.
- Branch `feature/<issue>-<slug>` from `develop` (`chore/`, `docs/` or `test/` per area). Implement exactly the Output, in the Where paths, and meet every Acceptance item.
- Commit with Conventional Commits and the scope of the app (`feat(api): …`). Open the PR to `develop` with `Closes #<issue>`.
- If you discover the plan is wrong (a missing task, a wrong dependency), edit the sprint file, run `python3 tools/backlog/backlog.py`, and mention it in the PR. Don't silently diverge.

## Hard rules
- Never push to `main` or `develop` directly. PRs only.
- Business time logic runs on the server in `Asia/Riyadh`. Money is integer halalas. Prices include 15% VAT.
- Every external provider (payments, SMS, delivery, ZATCA, push, storage, BNPL) sits behind its port in `services/api/src/integrations/`.
- Every UI string goes in AR and EN, RTL-safe (logical CSS properties, `Directionality` in Flutter).
- No secrets in the repo. Use `.env.example` for documentation only.

## Updating the plan or board
- `python3 tools/backlog/backlog.py` validates the plan. `python3 tools/backlog/sync.py` publishes changes to GitHub (needs `gh` with `repo, project, read:org`).
- After a sprint release, update `docs/delivery/STATUS.md` (current sprint, log entry, client inputs).
