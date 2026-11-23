---
description: Work on a Jazlah task end-to-end (issue number or key), using the role agent and the reviewer
argument-hint: <issue-number | TASK-KEY>
---

Work on Jazlah task **$ARGUMENTS** from start to PR. Follow these steps in order and stop to ask me whenever a step says so.

1. **Load the task**
   - Run `python3 tools/dev/task.py info $ARGUMENTS`. It returns the key, area, `agents`, branch, `blocked_by` and `ready`.
   - Read the task block in the `plan_file` (What / Output / How / Where / Acceptance) and the GitHub issue (`gh issue view <n> -R frentex-tech/jazlah --comments`) for any notes.
2. **Check the dependencies**
   - If `ready` is false, list the open blockers and **stop and ask me** whether to continue. Starting a task before its blockers are merged is only allowed against a mock.
3. **Start**
   - Make sure the working tree is clean (`git status`). If it isn't, stop and ask me.
   - Run `python3 tools/dev/task.py start $ARGUMENTS`. It assigns me, moves the card to **In Progress** and creates or switches to the branch from `origin/develop`.
4. **Implement with the role agent**
   - Delegate to the first agent in `agents` (e.g. `api-engineer`). Give it the task key, the full task block, the issue notes and the branch name, and tell it to implement exactly the Output in the Where paths and meet every Acceptance item.
   - If `agents` lists more than one (a task spanning several apps), run them **one after another**, API first, each with the same task block and the summary of the previous agent.
   - For `design` tasks, the `uiux-designer` works through Chrome + Figma Scripter. It needs me signed in to Figma, so ask me first.
5. **Review**
   - Delegate to the `reviewer` agent with the task block and the instruction to review `git diff origin/develop...HEAD`.
   - If it returns **CHANGES REQUIRED**, send the findings back to the role agent, then review again. Repeat until **APPROVE**, at most 3 rounds. After that, stop and show me the remaining findings.
6. **Commit and PR**
   - Commit with Conventional Commits and the app scope (e.g. `feat(api): …`). Squash noise.
   - Push the branch.
   - Open the PR to `develop` with `gh pr create`:
     - title in Conventional Commits format
     - body from `.github/pull_request_template.md`, including `Closes #<issue>`, how it was tested, screenshots (AR/EN) for UI, and the reviewer verdict
   - Run `python3 tools/dev/task.py move $ARGUMENTS "In Review"`.
7. **Plan drift**
   - If the work showed that the plan is wrong (missing piece, wrong dependency), edit the sprint file, run `python3 tools/backlog/backlog.py`, and mention it in the PR. Don't run `sync.py` yourself; tell me.
8. **Report** to me in Egyptian Arabic, briefly:
   - what was built
   - the acceptance checklist results
   - the PR link
   - what this unblocks next (`tools/dev/task.py info` on its dependents, or the issue's "Unblocks" line)

7b. **Merge (no second reviewer)**
   - Once CI is green and the reviewer verdict is APPROVE, merge the PR yourself: `gh pr merge <n> --squash --delete-branch`.
   - Then move the card: design and docs-only tasks to **Done**, code tasks to **QA** (`python3 tools/dev/task.py move $ARGUMENTS Done|QA`). The dashboard updates on merge.
   - Exception: a task that waits for a client decision (`needs-client`) is not closed or moved to Done until the client has answered.

Never push to `develop` or `main` directly, and never skip the reviewer.
