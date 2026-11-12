# Contributing to Jazlah

These are the team's working rules. The `PR policy` check enforces the branch, target and title rules on every pull request.

## 1. Branches

```
main ─────────●──────────────●────────────●──────  production (tagged releases only)
               \            / \          /
release/v1.0.0  \     ●────●   \        /          stabilisation (fixes only)
                 \   /          \      /
develop ──●───●───●───●────●─────●────●──────────  integration / staging
           \     /     \  /           \
feature/..  ●───●       ●●             hotfix/..
```

| Branch | Purpose | Created from | Merges into | How |
|---|---|---|---|---|
| `main` | Production. Every commit is a released version. | — | — | Only via PR from `release/*` or `hotfix/*` |
| `develop` | Integration branch, auto-deployed to **staging**. Default branch. | `main` | `release/*` | Only via PR |
| `feature/<issue>-<slug>` | One issue / sub-issue | `develop` | `develop` | PR, **squash merge** |
| `fix/<issue>-<slug>` | Bug fix found in develop or during a release | `develop` or `release/*` | the branch it came from | PR, squash merge |
| `chore/<issue>-<slug>`, `docs/…`, `refactor/…`, `test/…`, `perf/…`, `ci/…`, `build/…` | Tooling, docs, refactors, tests, performance, CI | `develop` | `develop` | PR, squash merge |
| `release/vX.Y.Z` | Freeze a sprint/version for QA. **No new features.** | `develop` | `main`, then `main` → `develop` | PR, **merge commit** + tag `vX.Y.Z` |
| `hotfix/<issue>-<slug>` | Urgent production fix | `main` | `main`, then `main` → `develop` | PR, merge commit + patch tag |

Examples: `feature/42-otp-login`, `fix/118-cutoff-timezone`, `release/v1.0.0`, `hotfix/203-payment-webhook`.

### What may merge where

| From → To | `develop` | `release/*` | `main` |
|---|---|---|---|
| `feature/*`, `chore/*`, `docs/*`, `refactor/*`, `test/*` | ✅ | ❌ | ❌ |
| `fix/*` | ✅ | ✅ (release fixes) | ❌ |
| `chore/*`, `docs/*`, `perf/*` during a release | ✅ | ✅ (no features) | ❌ |
| `release/*` | ✅ (back-merge) | — | ✅ |
| `hotfix/*` | ✅ (back-merge) | — | ✅ |
| `main` | ✅ (back-merge after a release/hotfix) | ❌ | — |

Rules:
- Never push directly to `main` or `develop`. The free plan can't enforce this, so it is a team rule.
- Keep feature branches short-lived (a few days at most) and rebase on `develop` before opening the PR.
- Delete the branch after merge.
- Each app is released independently through its own tags when needed: `api-v1.2.0`, `mobile-v1.2.0+15`, `web-v1.2.0`, `dashboard-v1.2.0`. A full platform release uses `vX.Y.Z`.

## 2. Commits & PR titles. Conventional Commits.

```
<type>(<scope>): <summary>

types : feat | fix | chore | docs | refactor | test | perf | ci | build | revert
scopes: api | mobile | web | dashboard | infra | docs | deps
```
Examples: `feat(api): add delivery window cutoff per order type`, `fix(mobile): keep RTL in cart dialog`.
The squash-merge commit uses the PR title, so the PR title must follow this format.

## 3. Pull requests

- One issue per PR. The body must include `Closes #<issue>`.
- Fill in the PR template (what changed, how it was tested, screenshots for UI, AR + EN checked).
- No second reviewer: the author self-reviews (diff, tests, lint, screenshots), then merges the PR themselves (squash) once CI is green.
- Keep PRs small, ideally under 400 changed lines.

## 4. Board workflow

| Column | Meaning | Who moves it |
|---|---|---|
| **Backlog** | Planned, not in the current sprint | — |
| **Todo** | In the current sprint, ready to start | Sprint planning |
| **In Progress** | Branch created, work started | Developer |
| **In Review** | PR open, self-review and CI in progress | Developer |
| **QA** | Merged to `develop`, being verified on staging | Reviewer |
| **Done** | Verified on staging, meets the DoD | Reviewer |

Labels: `area:*` (layer), `needs-client` (waiting for a client decision or input), `blocked`, `spike` (research / decision task), `security`, `tech-debt`.
Issue types: **Epic** (module), **Feature** (user-facing sub-issue), **Task** (technical sub-issue), **Bug**.

## 5. Definition of Done

- [ ] Acceptance criteria in the issue are met
- [ ] Self-reviewed and merged
- [ ] Unit tests for business logic, and API e2e tests for new endpoints
- [ ] Arabic (RTL) and English both work, with no hard-coded strings
- [ ] API changes are documented in Swagger/OpenAPI
- [ ] No secrets in code, inputs validated, permissions checked
- [ ] Verified on staging and moved to **Done**

## 6. Releases

1. At the end of a sprint, branch `release/vX.Y.0` from `develop`.
2. QA on staging. Fixes go as `fix/*` PRs into the release branch.
3. PR `release/vX.Y.0` → `main`, merge commit, tag `vX.Y.0`, and write release notes from merged PRs.
4. PR `main` → `develop` to bring back the release fixes.
