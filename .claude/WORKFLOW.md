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
3. Ask the other developer to review the PR. **They** merge it (squash) once the checks are green.
4. After the merge, the card goes to **QA**. Check it on staging (or ask the `qa-engineer`), then move it to **Done**:
   `python3 tools/dev/task.py move <n> Done`
5. At the end of the sprint, run `/release <sprint>`. When needed, `/status` refreshes `STATUS.md` and gives a summary you can forward.

## Rules that keep it clean
- One task = one branch = one PR. Never work on `develop` or `main`.
- Always assign yourself (`/task` does it). The progress dashboard credits work by assignee and PR author.
- Don't edit issue text on GitHub. Change the plan in `docs/delivery/sprints/*.md` and run `python3 tools/backlog/sync.py`.
- Design runs a sprint ahead: DES tasks of sprint N+1 should be done while sprint N is being built.
- Before starting a design task, the designer agent needs a browser signed in to Figma with the editing account. Start Chrome with remote debugging so the agent can drive it.
