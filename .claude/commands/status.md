---
description: Refresh docs/delivery/STATUS.md from GitHub and summarize where the project is
---

Update Jazlah's project status:

1. Read `docs/delivery/STATUS.md` and the pinned dashboard issue (`gh issue view <dashboard number from docs/delivery/issue-map.json> -R frentex-tech/jazlah`).
2. Collect the facts:
   - the current sprint and its open/closed tasks (`gh issue list --milestone …`)
   - PRs merged since the last log entry
   - open `needs-client` and `blocked` issues
   - the latest tag
3. Update **Current state**, **Waiting on the client** and add a dated **Log** entry. Write down any decisions made during the build (from PR descriptions) under **Decisions**.
4. Commit it on a `docs/<n>-status-update` branch, where `<n>` is the current sprint's REL issue number, and open a PR. Never commit to `develop` directly.
5. Give me a 5-line summary in Egyptian Arabic that I can forward: progress %, what was done, what's next, and what's waiting on the client.
