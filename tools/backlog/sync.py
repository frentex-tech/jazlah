#!/usr/bin/env python3
"""Publish docs/delivery/sprints/*.md to GitHub: labels, milestones, Epic/Feature/Task issues,
sub-issues, "blocked by" dependencies and the Project board fields.

Idempotent and resumable: state lives in docs/delivery/issue-map.json. Re-run after editing the plan;
changed tasks are updated in place (matched by key, never by title).

Usage:
  python3 tools/backlog/sync.py --check        # validate only, no network
  python3 tools/backlog/sync.py --dry-run      # print what would change
  python3 tools/backlog/sync.py                # apply
Requires: gh CLI authenticated with scopes repo, project, read:org.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import backlog  # noqa: E402

OWNER, REPO = "frentex-tech", "jazlah"
PROJECT_TITLE = "Jazlah — Delivery Board"
MAP_FILE = backlog.ROOT / "docs" / "delivery" / "issue-map.json"
BLOB = f"https://github.com/{OWNER}/{REPO}/blob/develop"

LABELS = {
    "area:api": ("1d76db", "Backend — services/api"),
    "area:mobile": ("0e8a16", "Flutter app — apps/mobile"),
    "area:web": ("5319e7", "Customer website — apps/web"),
    "area:dashboard": ("fbca04", "Admin / vendor / kitchen dashboards — apps/dashboard"),
    "area:design": ("f9a8d4", "UI/UX design (Figma)"),
    "area:infra": ("6e7781", "CI/CD, environments, releases"),
    "area:qa": ("c2e0c6", "Testing & quality"),
    "area:docs": ("bfdadc", "Documentation, legal"),
    "priority:P0": ("b60205", "Launch blocker"),
    "priority:P1": ("d93f0b", "Needed for launch, can slip within the sprint"),
    "priority:P2": ("fef2c0", "Nice to have"),
    "needs-client": ("e99695", "Waiting for a client decision or input"),
    "spike": ("c5def5", "Research task — output is a decision (ADR)"),
    "security": ("8b0000", "Security-sensitive"),
    "blocked": ("000000", "Cannot progress — explain in a comment"),
    "tech-debt": ("d4c5f9", "Shortcut to revisit"),
    "post-launch": ("ededed", "Phase 2 (after v1.0.0)"),
}
DEFAULT_LABELS = ["bug", "documentation", "duplicate", "enhancement", "good first issue",
                  "help wanted", "invalid", "question", "wontfix"]
STATUS_OPTIONS = [("Backlog", "GRAY", "Planned, not in the current sprint"),
                  ("Todo", "BLUE", "In the current sprint, ready to start"),
                  ("In Progress", "YELLOW", "Branch created, work started"),
                  ("In Review", "ORANGE", "PR open, waiting for review"),
                  ("QA", "PURPLE", "Merged to develop, verifying on staging"),
                  ("Done", "GREEN", "Verified on staging, meets the DoD")]
FIELDS = {
    "Priority": [("P0", "RED", "Launch blocker"), ("P1", "ORANGE", "Needed for launch"), ("P2", "GRAY", "Nice to have")],
    "Size": [(s, c, d) for s, c, d in [("XS", "GRAY", "≤ ½ day"), ("S", "BLUE", "≈ 1 day"), ("M", "GREEN", "2–3 days"),
                                        ("L", "YELLOW", "4–5 days"), ("XL", "RED", "≈ 1–2 weeks")]],
    "Area": [(a, c, "") for a, c in [("api", "BLUE"), ("mobile", "GREEN"), ("web", "PURPLE"), ("dashboard", "YELLOW"),
                                     ("design", "PINK"), ("infra", "GRAY"), ("qa", "ORANGE"), ("docs", "GRAY")]],
}
COMMIT_TYPE = {"Feature": "feat", "Task": "chore"}
SCOPE = {"api": "api", "mobile": "mobile", "web": "web", "dashboard": "dashboard",
         "infra": "infra", "design": "docs", "qa": "api", "docs": "docs"}
BRANCH_PREFIX = {"design": "docs", "docs": "docs", "qa": "test", "infra": "chore"}

DRY = False


# ---------------------------------------------------------------- gh helpers
def gh(method, path, body=None, ok404=False):
    args = ["gh", "api", "-X", method, path, "-H", "X-GitHub-Api-Version: 2022-11-28"]
    if body is not None:
        args += ["--input", "-"]
    for attempt in range(8):
        p = subprocess.run(args, input=json.dumps(body) if body is not None else None,
                           capture_output=True, text=True)
        if p.returncode == 0:
            if method != "GET":
                time.sleep(1.0)  # stay under the 80/min content-creation secondary limit
            return json.loads(p.stdout) if p.stdout.strip() else {}
        err = p.stderr + p.stdout
        if ok404 and "404" in err:
            return None
        if "secondary rate limit" in err.lower() or "429" in err or "abuse" in err.lower():
            wait = 60 * (attempt + 1)
            print(f"   rate limited, sleeping {wait}s", flush=True)
            time.sleep(wait)
            continue
        if "502" in err or "503" in err or "timeout" in err.lower() or "something went wrong" in err.lower():
            time.sleep(5 * (attempt + 1))
            continue
        raise RuntimeError(f"gh {method} {path} failed: {err.strip()[:600]}")
    raise RuntimeError(f"gh {method} {path}: retries exhausted")


def gql(query, **variables):
    res = gh("POST", "graphql", {"query": query, "variables": variables})
    if res.get("errors"):
        raise RuntimeError(json.dumps(res["errors"])[:800])
    return res["data"]


def paged(path):
    out, page = [], 1
    while True:
        sep = "&" if "?" in path else "?"
        chunk = gh("GET", f"{path}{sep}per_page=100&page={page}")
        out += chunk
        if len(chunk) < 100:
            return out
        page += 1


# ---------------------------------------------------------------- rendering
def slug(text, n=5):
    words = re.findall(r"[a-z0-9]+", text.lower())
    stop = {"the", "and", "a", "an", "of", "for", "to", "with", "on", "in", "by"}
    return "-".join([w for w in words if w not in stop][:n]) or "task"


def task_title(t):
    return f"[{t.meta['area'].upper()}] {t.title} · {t.key}"


def epic_title(e):
    return f"Epic: {e.title} · {e.key}"


def num(state, key):
    return state["issues"].get(key, {}).get("number") or state.get("predicted", {}).get(key)


def ref(state, key, plan):
    n = num(state, key)
    title = plan.tasks[key].title if key in plan.tasks else plan.epics[key].title
    return f"#{n} `{key}` {title}" if n else f"`{key}` {title}"


def render_task(t, plan, state, deps_of, reqs):
    area, size, prio = t.meta["area"], t.meta["size"], t.meta["prio"]
    epic = plan.epics[t.epic]
    lines = [f"> **Sprint:** {t.sprint} · **Epic:** {ref(state, epic.key, plan)} · "
             f"**Area:** `{area}` · **Size:** {size} · **Priority:** {prio}"]
    if "needs-client" in t.list_meta("labels"):
        lines.append("> ⚠️ **Needs client input** — see `docs/delivery/integration-plan.md` §5 for the fallback.")
    heads = {"What": "🎯 What to build", "Output": "📦 Output (deliverables)", "How": "🛠️ How",
             "Where": "📁 Where in the repo", "Acceptance": "✅ Acceptance criteria"}
    for s in backlog.SECTIONS:
        if t.sections.get(s):
            txt = t.sections[s]
            lines += ["", f"### {heads[s]}", txt[:1].upper() + txt[1:]]
    rq = t.list_meta("reqs")
    if rq:
        lines += ["", "### 📚 SRS requirements"]
        for r in rq:
            anchor = r.lower()
            lines.append(f"- [**{r}**]({BLOB}/docs/requirements.md#{anchor}) — {reqs.get(r, '')}")
    blocked_by, unblocks = t.list_meta("depends"), deps_of.get(t.key, [])
    lines += ["", "### 🔗 Dependencies"]
    lines.append("- **Blocked by** (must be merged into `develop` first): " +
                 (", ".join(ref(state, d, plan) for d in blocked_by) if blocked_by else "none — can start any time in the sprint"))
    if unblocks:
        lines.append("- **Unblocks:** " + ", ".join(ref(state, d, plan) for d in unblocks))
    rel = next((k for k in plan.epics["REL"].tasks if k.sprint == t.sprint), None) if "REL" in plan.epics else None
    n = num(state, t.key) or "<issue>"
    prefix = BRANCH_PREFIX.get(area, "feature" if t.meta["type"] == "Feature" else "chore")
    ctype = {"docs": "docs", "test": "test"}.get(prefix, COMMIT_TYPE[t.meta["type"]])
    lines += ["", "### 🌿 Branch & merge",
              f"- Branch: `{prefix}/{n}-{slug(t.title)}` from `develop`",
              f"- PR → `develop` · squash merge · title `{ctype}({SCOPE[area]}): {t.title[:60].lower()}` · body `Closes #{n}`",
              "- Move the card: **In Progress** when the branch exists → **In Review** when the PR opens → **QA** after merge → **Done** after staging check"]
    if rel and rel.key != t.key:
        lines.append(f"- Ships in the sprint merge point {ref(state, rel.key, plan)}")
    lines.append(f"- [Definition of Done]({BLOB}/CONTRIBUTING.md#5-definition-of-done) · "
                 f"[Architecture]({BLOB}/docs/architecture.md) · [Integration plan]({BLOB}/docs/delivery/integration-plan.md)")
    lines += ["", f"<sub>Generated from [`docs/delivery/sprints/{t.file}`]({BLOB}/docs/delivery/sprints/{t.file}) "
                  f"· key `{t.key}` · edit the file and run `tools/backlog/sync.py`, not this issue.</sub>"]
    return "\n".join(lines)


def render_epic(e, plan, state, reqs):
    lines = [f"> **Sprint{'s' if len(set(e.sprints)) > 1 else ''}:** {', '.join(dict.fromkeys(e.sprints))}", "", e.summary or ""]
    if e.reqs:
        lines += ["", "### 📚 SRS requirements covered"]
        lines += [f"- [**{r}**]({BLOB}/docs/requirements.md#{r.lower()}) — {reqs.get(r, '')}" for r in e.reqs]
    lines += ["", "### 🧩 Tasks (sub-issues)", "", "| Task | Area | Size | Priority | Blocked by |", "|---|---|---|---|---|"]
    for t in e.tasks:
        deps = ", ".join(f"#{num(state, d)}" if num(state, d) else f"`{d}`" for d in t.list_meta("depends")) or "—"
        lines.append(f"| {ref(state, t.key, plan)} | {t.meta['area']} | {t.meta['size']} | {t.meta['prio']} | {deps} |")
    lines += ["", f"<sub>Generated from `docs/delivery/sprints/` · epic `{e.key}`.</sub>"]
    return "\n".join(lines)


def digest(*parts):
    return hashlib.sha1(json.dumps(parts, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]


# ---------------------------------------------------------------- steps
def load_state():
    if MAP_FILE.exists():
        return json.loads(MAP_FILE.read_text())
    return {"issues": {}, "milestones": {}, "project": {}}


def save_state(state):
    if not DRY:
        MAP_FILE.write_text(json.dumps(state, indent=1, ensure_ascii=False, sort_keys=True) + "\n")


def ensure_labels():
    existing = {l["name"]: l for l in paged(f"repos/{OWNER}/{REPO}/labels")}
    for name in DEFAULT_LABELS:
        if name in existing:
            print(f"  - delete default label {name}")
            if not DRY:
                gh("DELETE", f"repos/{OWNER}/{REPO}/labels/{name.replace(' ', '%20')}")
    for name, (color, desc) in LABELS.items():
        cur = existing.get(name)
        if not cur:
            print(f"  + label {name}")
            if not DRY:
                gh("POST", f"repos/{OWNER}/{REPO}/labels", {"name": name, "color": color, "description": desc})
        elif cur["color"] != color or (cur.get("description") or "") != desc:
            if not DRY:
                gh("PATCH", f"repos/{OWNER}/{REPO}/labels/{name.replace(':', '%3A')}", {"color": color, "description": desc})


def ensure_milestones(plan, state):
    existing = {m["title"]: m for m in paged(f"repos/{OWNER}/{REPO}/milestones?state=all")}
    for s in plan.sprints:
        goal = re.search(r"^> \*\*Goal:\*\* (.+)$", s.header, re.M)
        desc = (goal.group(1) if goal else "")[:700] + f"\n\nPlan: docs/delivery/sprints/{s.file}"
        m = existing.get(s.name)
        if not m:
            print(f"  + milestone {s.name}")
            if not DRY:
                m = gh("POST", f"repos/{OWNER}/{REPO}/milestones", {"title": s.name, "description": desc})
        elif m.get("description") != desc and not DRY:
            gh("PATCH", f"repos/{OWNER}/{REPO}/milestones/{m['number']}", {"description": desc})
        if m:
            state["milestones"][s.name] = m["number"]


def ensure_epic_type():
    types = gh("GET", f"orgs/{OWNER}/issue-types")
    if any(t["name"] == "Epic" for t in types):
        return "Epic"
    print("  + org issue type Epic")
    if DRY:
        return "Epic"
    try:
        gh("POST", f"orgs/{OWNER}/issue-types", {"name": "Epic", "is_enabled": True, "color": "purple",
                                                 "description": "A module grouping related features and tasks"})
        return "Epic"
    except RuntimeError as e:
        print(f"   could not create Epic type ({e}); epics will use type Feature + title prefix")
        return "Feature"


def upsert_issue(key, title, body, labels, milestone, itype, state):
    rec = state["issues"].get(key)
    d = digest(title, body, sorted(labels), milestone, itype)
    payload = {"title": title, "body": body, "labels": labels, "milestone": milestone, "type": itype}
    if rec and rec.get("digest") == d:
        return rec, False
    if DRY:
        print(f"  {'~' if rec else '+'} {key}: {title}")
        return rec or {}, True
    if rec:
        cur = gh("GET", f"repos/{OWNER}/{REPO}/issues/{rec['number']}")
        # keep checkboxes developers ticked, and labels added by hand (blocked, tech-debt, ...)
        for line in re.findall(r"^- \[x\] (.+)$", cur.get("body") or "", re.M):
            payload["body"] = payload["body"].replace(f"- [ ] {line}", f"- [x] {line}")
        manual = [l["name"] for l in cur.get("labels", []) if l["name"] not in LABELS]
        payload["labels"] = sorted(set(labels) | set(manual))
        gh("PATCH", f"repos/{OWNER}/{REPO}/issues/{rec['number']}", payload)
        rec["digest"] = d
        print(f"  ~ #{rec['number']} {key}")
    else:
        res = gh("POST", f"repos/{OWNER}/{REPO}/issues", payload)
        rec = {"number": res["number"], "id": res["id"], "node_id": res["node_id"], "digest": d}
        state["issues"][key] = rec
        print(f"  + #{res['number']} {key}", flush=True)
    save_state(state)
    return rec, True


def ensure_issues(plan, state, epic_type, reqs, deps_of):
    """Two passes: create everything (so numbers exist), then re-render bodies that reference numbers."""
    def task_labels(t):
        ls = [f"area:{t.meta['area']}", f"priority:{t.meta['prio']}"] + t.list_meta("labels")
        if t.sprint.startswith("Post-launch"):
            ls.append("post-launch")
        return ls

    if not state["issues"] and not DRY:
        # new repo: issue numbers are sequential, so predict them and avoid a second pass of edits
        existing = gh("GET", f"repos/{OWNER}/{REPO}/issues?state=all&per_page=1")
        if not existing:
            order = [k for e in plan.epics.values() for k in [e.key] + [t.key for t in e.tasks]]
            state["predicted"] = {k: i + 1 for i, k in enumerate(order)}
    for p in (1, 2):
        print(f" pass {p}")
        for e in plan.epics.values():
            ms = state["milestones"].get(e.sprints[0]) if len(set(e.sprints)) == 1 else None
            labels = ["post-launch"] if e.sprints[0].startswith("Post-launch") else []
            upsert_issue(e.key, epic_title(e), render_epic(e, plan, state, reqs), labels, ms, epic_type, state)
            for t in e.tasks:
                upsert_issue(t.key, task_title(t), render_task(t, plan, state, deps_of, reqs), task_labels(t),
                             state["milestones"].get(t.sprint), t.meta["type"], state)


def ensure_sub_issues(plan, state):
    for e in plan.epics.values():
        er = state["issues"].get(e.key)
        if not er or DRY:
            continue
        current = {i["id"] for i in paged(f"repos/{OWNER}/{REPO}/issues/{er['number']}/sub_issues")}
        for t in e.tasks:
            tr = state["issues"][t.key]
            if tr["id"] not in current:
                gh("POST", f"repos/{OWNER}/{REPO}/issues/{er['number']}/sub_issues",
                   {"sub_issue_id": tr["id"], "replace_parent": True})
                print(f"  ⤷ {e.key} ← {t.key}", flush=True)


def ensure_dependencies(plan, state):
    for t in plan.tasks.values():
        tr = state["issues"].get(t.key)
        want = t.list_meta("depends")
        if not tr or DRY or (not want and not tr.get("deps")):
            continue
        if tr.get("deps") == want:
            continue
        have = {i["id"] for i in (gh("GET", f"repos/{OWNER}/{REPO}/issues/{tr['number']}/dependencies/blocked_by", ok404=True) or [])}
        want_ids = {state["issues"][d]["id"] for d in want}
        for stale in have - want_ids:
            gh("DELETE", f"repos/{OWNER}/{REPO}/issues/{tr['number']}/dependencies/blocked_by/{stale}")
        for d in want:
            did = state["issues"][d]["id"]
            if did not in have:
                gh("POST", f"repos/{OWNER}/{REPO}/issues/{tr['number']}/dependencies/blocked_by", {"issue_id": did})
        tr["deps"] = want
        save_state(state)
        print(f"  ⛓ {t.key} blocked by {', '.join(want)}", flush=True)


# ---------------------------------------------------------------- project
Q_ORG = "query($login:String!){organization(login:$login){id projectsV2(first:50){nodes{id number title}}}}"
Q_REPO = "query($o:String!,$r:String!){repository(owner:$o,name:$r){id}}"
Q_FIELDS = """query($id:ID!){node(id:$id){... on ProjectV2{fields(first:50){nodes{
  ... on ProjectV2FieldCommon{id name dataType}
  ... on ProjectV2SingleSelectField{id name options{id name}}}}}}}"""


def opts(lst):
    return [{"name": n, "color": c, "description": d} for n, c, d in lst]


def ensure_project(state):
    org = gql(Q_ORG, login=OWNER)["organization"]
    proj = next((p for p in org["projectsV2"]["nodes"] if p["title"] == PROJECT_TITLE), None)
    if not proj:
        print(f"  + project {PROJECT_TITLE}")
        if DRY:
            return None
        repo_id = gql(Q_REPO, o=OWNER, r=REPO)["repository"]["id"]
        proj = gql("""mutation($o:ID!,$t:String!,$r:ID!){createProjectV2(input:{ownerId:$o,title:$t,repositoryId:$r})
                      {projectV2{id number title}}}""", o=org["id"], t=PROJECT_TITLE, r=repo_id)["createProjectV2"]["projectV2"]
    readme = (backlog.ROOT / "docs" / "delivery" / "board.md").read_text(encoding="utf-8")
    if not DRY:
        gql("""mutation($p:ID!,$s:String!,$r:String!){updateProjectV2(input:{projectId:$p,shortDescription:$s,readme:$r}){projectV2{id}}}""",
            p=proj["id"], s="Jazlah (جزلة) build plan — 7 sprints to v1.0.0, then post-launch. Generated from docs/delivery.", r=readme)
    fields = {f["name"]: f for f in gql(Q_FIELDS, id=proj["id"])["node"]["fields"]["nodes"] if f}
    if not DRY:
        st = fields["Status"]
        # only replace the GitHub defaults on a fresh project; replacing later would clear every card's Status
        if [o["name"] for o in st.get("options", [])] == ["Todo", "In Progress", "Done"]:
            gql("""mutation($f:ID!,$o:[ProjectV2SingleSelectFieldOptionInput!]){updateProjectV2Field(input:{fieldId:$f,singleSelectOptions:$o}){projectV2Field{... on ProjectV2SingleSelectField{id}}}}""",
                f=st["id"], o=opts(STATUS_OPTIONS))
        for name, o in FIELDS.items():
            if name not in fields:
                print(f"  + field {name}")
                gql("""mutation($p:ID!,$n:String!,$o:[ProjectV2SingleSelectFieldOptionInput!]){createProjectV2Field(input:{projectId:$p,dataType:SINGLE_SELECT,name:$n,singleSelectOptions:$o}){projectV2Field{... on ProjectV2SingleSelectField{id}}}}""",
                    p=proj["id"], n=name, o=opts(o))
        fields = {f["name"]: f for f in gql(Q_FIELDS, id=proj["id"])["node"]["fields"]["nodes"] if f}
    state["project"] = {"id": proj["id"], "number": proj["number"],
                        "fields": {n: {"id": f["id"], "options": {o["name"]: o["id"] for o in f.get("options", [])}}
                                   for n, f in fields.items() if n in ("Status", *FIELDS)}}
    save_state(state)
    return state["project"]


def ensure_project_items(plan, state, current_sprint):
    pr = state.get("project")
    if not pr or DRY:
        return
    F = pr["fields"]
    keys = list(plan.epics) + list(plan.tasks)
    for key in keys:
        rec = state["issues"].get(key)
        if not rec:
            continue
        t = plan.tasks.get(key)
        want = {"Status": ("Todo" if (t and t.sprint == current_sprint) else "Backlog")}
        if t:
            want.update({"Priority": t.meta["prio"], "Size": t.meta["size"], "Area": t.meta["area"]})
        if rec.get("item") and rec.get("fields") and all(rec["fields"].get(k) == v for k, v in want.items() if k != "Status"):
            continue
        if not rec.get("item"):
            rec["item"] = gql("""mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}""",
                              p=pr["id"], c=rec["node_id"])["addProjectV2ItemById"]["item"]["id"]
        old = rec.get("fields")
        # Status is only set when the item is first added, so cards moved on the board are never reset
        changes = dict(want) if old is None else {k: v for k, v in want.items() if k != "Status" and old.get(k) != v}
        parts = []
        for i, (fname, val) in enumerate(changes.items()):
            parts.append(f'f{i}: updateProjectV2ItemFieldValue(input:{{projectId:"{pr["id"]}",itemId:"{rec["item"]}",'
                         f'fieldId:"{F[fname]["id"]}",value:{{singleSelectOptionId:"{F[fname]["options"][val]}"}}}}){{clientMutationId}}')
        if parts:
            gql("mutation{" + " ".join(parts) + "}")
        rec["fields"] = want
        save_state(state)
        print(f"  ▣ board {key} {changes}", flush=True)


def ensure_dashboard(state):
    if state.get("dashboard") or DRY:
        return
    res = gh("POST", f"repos/{OWNER}/{REPO}/issues", {
        "title": "📊 Project progress dashboard",
        "body": "Filled automatically by the *Progress dashboard* workflow (daily and on every closed issue / merged PR)."})
    state["dashboard"] = res["number"]
    save_state(state)
    try:
        gql("mutation($i:ID!){pinIssue(input:{issueId:$i}){issue{number}}}", i=res["node_id"])
    except RuntimeError as e:
        print(f"   could not pin dashboard issue: {e}")
    print(f"  + dashboard issue #{res['number']} (pinned)")


def main():
    global DRY
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--current-sprint", default=None, help="milestone whose tasks start in Todo (default: first sprint)")
    a = ap.parse_args()
    DRY = a.dry_run
    plan = backlog.load()
    problems = backlog.validate(plan)
    print(f"{len(plan.sprints)} sprints · {len(plan.epics)} epics · {len(plan.tasks)} tasks")
    if problems:
        print("Plan has problems — fix them first:\n  " + "\n  ".join(problems))
        sys.exit(1)
    if a.check:
        print("plan OK")
        return
    reqs = backlog.known_requirements()
    deps_of = backlog.dependents(plan)
    state = load_state()
    print("labels");      ensure_labels()
    print("milestones");  ensure_milestones(plan, state); save_state(state)
    print("issue types"); epic_type = ensure_epic_type()
    print("issues");      ensure_issues(plan, state, epic_type, reqs, deps_of)
    print("sub-issues");  ensure_sub_issues(plan, state)
    print("dependencies"); ensure_dependencies(plan, state)
    print("project");     ensure_project(state)
    print("board items"); ensure_project_items(plan, state, a.current_sprint or plan.sprints[0].name)
    print("dashboard");   ensure_dashboard(state)
    print("done")


if __name__ == "__main__":
    main()
