# Team workflow with Claude Code (internal)

This is how the developers work. It's internal tooling: the board and issues only show tasks, progress and PRs.

## Roles → agents

| Role | Agent (`.claude/agents/`) | Picks up tasks with area | Works in |
|---|---|---|---|
| Backend | `api-engineer` | `api` | `services/api` |
| Mobile | `flutter-engineer` | `mobile` | `apps/mobile` |
| Customer web | `web-engineer` | `web` | `apps/web` |
| Dashboards | `dashboard-engineer` | `dashboard` | `apps/dashboard` |
| DevOps / releases | `devops-engineer` | `infra` | root tooling, `infra`, `.github` |
| QA | `qa-engineer` | `qa` + staging verification | tests, `docs/qa` |
| UI/UX | `uiux-designer` | `design` | Figma (via Scripter), `design/figma/scripts`, `docs/design` |
| Code review | `reviewer` (read-only) | every task before its PR | — |

The mapping lives in `tools/dev/task.py`. A task whose **Where** spans several apps gets several agents, run in order with the API first.

## Daily loop (each developer)
1. Open the board. Pick a card in **Todo** for the current sprint whose blockers are merged, so the issue shows no open "Blocked by".
2. In Claude Code, in the repo: `/task <issue-number>`. It assigns you, moves the card, branches, delegates to the role agent, runs the reviewer and opens the PR.
3. Self-review the PR (the `reviewer` agent already ran; check CI and, for UI, the screenshots), then merge it yourself: `gh pr merge <n> --squash --delete-branch`. No second reviewer.
4. After the merge: **design tasks** (and docs-only tasks) go straight to **Done**: `python3 tools/dev/task.py move <n> Done`. Code tasks go to **QA**; check them on staging (or ask the `qa-engineer`), then move them to **Done**. The progress dashboard updates by itself on merge.
5. At the end of the sprint, run `/release <sprint>`. When needed, `/status` refreshes `STATUS.md` and gives a summary you can forward.

## Rules that keep it clean
- One task = one branch = one PR. Never work on `develop` or `main`.
- Always assign yourself (`/task` does it). The progress dashboard credits work by assignee and PR author.
- Don't edit issue text on GitHub. Change the plan in `docs/delivery/sprints/*.md` and run `python3 tools/backlog/sync.py`.
- Design-first: all launch screens are designed and client-approved in Sprint 1 (DSN-DES-2) before any front-end screen is built. The backend and infra don't wait for design.
- Before starting a design task, the designer agent needs a browser signed in to Figma with the editing account. Start Chrome with remote debugging so the agent can drive it.
