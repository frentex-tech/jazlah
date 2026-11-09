---
description: Close a sprint — cut the release branch, verify exit criteria, open the release PR
argument-hint: <sprint-number>
---

Close **Sprint $ARGUMENTS** of Jazlah using the `devops-engineer` agent, following CONTRIBUTING.md §6.

1. Read `docs/delivery/sprints/sprint-$ARGUMENTS.md`: the **Exit criteria**, the **Merge points** and its `REL-INF-$ARGUMENTS` task.
2. List the sprint's open issues: `gh issue list -R frentex-tech/jazlah --milestone "<sprint title>" --state open`. If any P0 task is open, stop and show me the list. Each must be done, or moved with my approval and a reason.
3. Cut `release/v0.$ARGUMENTS.0` from `origin/develop` (for Sprint 7, `release/v1.0.0`) and push it.
4. Use the `qa-engineer` agent to run every exit criterion on staging and record the results (pass/fail + evidence).
5. Open the PR `release/…` → `main` with the exit criteria checklist ticked, the release notes (generated from the PRs merged since the last tag) and the known issues.
6. Tell me to merge it. **I** merge, with a merge commit. Then: tag `v0.$ARGUMENTS.0`, open the back-merge PR `main` → `develop`, trigger the mobile staging build, and run `/status`.
7. Report in Egyptian Arabic: what shipped, what moved, and the links.
