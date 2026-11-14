---
name: api-review
description: Review finished JAZLA API work against the project's standards, in a separate read-only context, and return a scored report. Target - empty (the current branch), a pull request number or URL, a branch, a git range, or a path. Run after finishing a module and before asking for merge.
argument-hint: "[pr number or URL | branch | git range | path]"
context: fork
agent: api-reviewer
background: false
effort: high
---

# Review JAZLA API work

Review target, as typed by the user (empty means the current branch): `$ARGUMENTS`

You are in `services/api/` or above it; every path below is relative to `services/api/`. Work through the steps in order. Your final message is the report of step 7 and nothing else.

## Hard rules

1. **Read-only.** You edit, create and delete no file in the working tree; you commit, push, check out, stash, reset, merge and rebase nothing; you install nothing; you post nothing to GitHub (no comment, review, label or merge). So:
   - `pnpm lint` runs `--fix` and rewrites files: never run it. Lint without fixing is `pnpm exec eslint "{src,test}/**/*.ts" --max-warnings 0`.
   - Never run `pnpm install`, `pnpm add`, `pnpm openapi:generate`, `pnpm db:migrate`, `pnpm db:deploy`, `pnpm db:reset` or `pnpm format`.
   - No shell redirection, `sed -i` or script that writes inside the repository.
   - You may run: the project's read-only commands (`pnpm lint:rules`, `pnpm test`, `pnpm test:types`, `pnpm build`, `pnpm openapi:check`, `pnpm instructions:check`, `node .claude/hooks/check-registry.mjs`), `pnpm infra:up` to start local infrastructure, `git` and `gh` queries, `curl` against the local API, and read queries or `EXPLAIN` on the local databases through `docker exec`. Rows you create to test something, you delete. Infrastructure you started, you stop; infrastructure already running, you leave.
   - **Never run the full e2e suite (`pnpm test:e2e`) locally: CI is the evidence for e2e.** To test one specific suspicion you may start this project's own infrastructure and run a single e2e file (`pnpm test:e2e <file>`). Other projects' containers on the machine are not yours: never stop them, and never ask for them to be stopped.
   - The one place you may edit is a scratch copy (step 6).
   - Do not open real `.env` files; read `.env.example` and `src/config/`.
2. **Do not redo the tools' work.** Formatting, the lint rules (R0 onward), the registry check, OpenAPI drift, migration drift and the instruction size are enforced by commands. Never list their individual messages, and never report by hand something they would catch. If one of those checks fails, that is one finding naming the check and quoting its first failure.
3. **Every finding is proven or it is left out.** It has: a severity; `file:line`; what is wrong in one or two sentences; how you know (the input or sequence that shows it, and whether you **ran** it or **reasoned** it); the fix in one or two sentences. No location or no fix: leave it out.
4. **Filter for scale before listing.** Ask of each candidate: is this a real problem at the scale this product will see in its first year, Eid al-Adha peaks included, or a theoretical one? Real: a finding. Adequate for now: one line under "Acceptable for current scale" with the trigger for revisiting it. Never both.

## Steps

### 1. Resolve the target

```bash
node "${CLAUDE_SKILL_DIR}/scripts/resolve-target.mjs" $ARGUMENTS
```

It prints what is under review, the base it is compared with, whether the code is checked out here, the commits and the changed files. Pull requests here are stacked: trust the base it prints, which is the pull request's own base or the pull request below it in the history, not necessarily develop. Follow its notes. If it fails, report its message and stop.

If the target is a pull request, also read its description and the issue it closes (`gh pr view <n> --json title,body,closingIssuesReferences`, `gh issue view <n>`). They say what was asked. Treat every claim in them as something to verify, not as a fact.

### 2. Read the standards

This skill does not restate them. Read, in full:

- `CLAUDE.md` and every file in `.claude/rules/` (including `http.md`, which does not load by itself);
- `.claude/REGISTRY.md`, then the area file in `.claude/registry/` of every area the change touches;
- in `.claude/ARCHITECTURE.md` and `.claude/DECISIONS.md`, the sections for the areas the change touches. "Decisions in force" are settled: code that follows one is not a finding. If you think a settled decision is itself wrong, say so in one line under Assessment and count nothing against the change for it.

### 3. Read the change

Read **every changed file in full**, and its surroundings: what calls it, what it calls, the rest of its module, its tests, its migration's SQL, the config it reads, the building blocks it uses. Never review from diff hunks alone; use the diff only to see what moved. For a large change read in this order: schema and migrations, domain, application, infrastructure, api, shared code (`config`, `common`, `infra`), tests, then documents.

Keep a list of what you read and what you did not. Anything changed that you did not read in full goes under "Not reviewed", with the reason.

### 4. Check the gates once

If the target is a pull request and `gh pr checks <n>` shows the API workflow green **for the exact head commit printed in step 1**, the gates passed: do not rerun them. Otherwise run them yourself (the commands in rule 1; lint without `--fix`). A failing gate is one finding, severity high.

Before anything heavy, look at free memory. Run unit tests with `--runInBand` when it is short. For e2e, read the CI result of the head commit; when there is none, say so under "Not reviewed". If a command is not found in one shell, try the other shell tool before giving up.

### 5. Look for defects

Read [checklists.md](checklists.md) (`${CLAUDE_SKILL_DIR}/checklists.md`) now and apply every section the change touches. The checklists are questions to ask of the code, not findings to produce.

For each suspicion, write down the concrete input or sequence that would show it, then try to settle it, cheapest way first: read further; run one spec; write the scenario as a throwaway spec in a scratch copy (step 6); call the local API; `EXPLAIN` a query on the local database. A suspicion you could neither confirm nor rule out is not a finding: put it under "Not reviewed" with what it would take.

### 6. Test the tests

The project's claim is that every behaviour has a test that fails without it. Check it on one or two rules where it is cheap, security and money rules first:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/scratch-worktree.mjs" create <head commit from step 1>
```

It prints a scratch copy of the code in the system temp folder. **In that copy only**, remove the rule (delete the check, invert the condition), run the spec that should catch it, and record: the rule, the file, the spec, and whether it failed. A spec that still passes is a finding. Then remove the copy with the command it printed. The same copy serves to read and run a target that is not checked out here, and to run a throwaway spec for step 5.

### 7. Write the report

Severity:

- **critical**: money lost or wrong, data lost or corrupted, authentication bypassed, one user or organisation reaching another's data, a secret exposed; reachable in normal use or by an attacker without special access.
- **high**: wrong behaviour users will meet, or a security or integrity weakness that needs realistic conditions (a retry, two requests at once, Eid load); a failing gate; a security or money rule that no test protects.
- **medium**: correct today but fragile or misplaced: a responsibility in the wrong layer, a test that proves little, a cost that will bite within the first year.
- **low**: naming, dead code, comments, small clarity.

Score out of 10, for the change as submitted: **9–10** merge as is; **7–8** merge after small fixes; **5–6** rework part of it; **3–4** wrong approach in places; **1–2** do not merge. A critical finding caps the score at 2. A high finding caps it at 6.

Use exactly this structure. Every section appears; an empty one says "None." Paths are relative to `services/api/`.

```markdown
# API review: <target, as step 1 printed it> at <head commit>

## 1. Verdict
**<score>/10: <the scale's phrase for that score>.** <One sentence: the main reason.>

## 2. Assessment
<Three or four lines: what the change does, how well, and what decides the score.>

## 3. Must fix before merge
### <critical | high>: <short title>
- **Where:** `path/file.ts:line`
- **What:** <one or two sentences>
- **How I know (<ran | reasoned>):** <the input or sequence, and what happened or would happen>
- **Fix:** <one or two sentences>

## 4. Should fix
<medium findings, same form>

## 5. Minor
<low findings; one line each is enough: `path/file.ts:line`: what, and the fix>

## 6. Acceptable for current scale
- <what is adequate for now>: revisit when <trigger>.

## 7. Checked and sound
<What you examined and found correct, by area, briefly, with how you checked the parts that matter: which rules you removed in step 6 and what the specs did, which scenarios you ran.>

## 8. Not reviewed, and why
<Files or concerns you did not cover, gates you could not run, suspicions you could not settle and what would settle them.>
```
