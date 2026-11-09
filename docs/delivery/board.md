# Jazlah — How to follow the project

**For management:** open the repository and read the pinned issue **📊 Project progress dashboard**. It updates automatically every morning and whenever a task is closed or a PR is merged. It shows:
- overall progress to the v1.0.0 launch (weighted by task size)
- progress of each sprint
- what each team member has delivered (tasks done, PRs merged, size points)
- what is waiting on the client
- everything completed in the last 7 days

**The board** (GitHub Project *Jazlah — Delivery Board*) shows every task as a card:

| Column | Meaning |
|---|---|
| Backlog | Planned for a later sprint |
| Todo | In the current sprint, not started |
| In Progress | Someone is working on it (the assignee) |
| In Review | Code is done and waiting for the other developer's review |
| QA | Merged and being checked on the staging environment |
| Done | Finished and verified |

**Suggested views** (tabs on the board):
1. **Sprint board:** Board layout, grouped by Status, filtered to the current milestone.
2. **Roadmap by sprint:** Table grouped by Milestone, showing sub-issue progress.
3. **Epics:** Table filtered to `type:Epic`, with the sub-issues progress column. Shows each module's % complete.
4. **By person:** Board grouped by Assignees, filtered to `-status:Done`.
5. **Waiting on client:** Table filtered to `label:needs-client is:open`.

**Structure:** 7 sprints to launch, then post-launch. Each module is an **Epic**, split into **tasks** (sub-issues), each with exact deliverables, acceptance criteria and dependencies. The full written plan lives in `docs/delivery/` in the repository.
