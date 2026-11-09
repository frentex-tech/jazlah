#!/usr/bin/env python3
"""Developer helper used by the /task command (and by humans).

  python3 tools/dev/task.py info <issue|KEY>          task key, area, agent, branch, deps and whether they're merged
  python3 tools/dev/task.py move <issue|KEY> <Status>  move the board card (Todo, In Progress, In Review, QA, Done)
  python3 tools/dev/task.py start <issue|KEY>          assign @me + move to In Progress + create the branch from develop

Requires: gh authenticated with repo + project scopes.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "backlog"))
import backlog  # noqa: E402

REPO = "frentex-tech/jazlah"
MAP = json.loads((ROOT / "docs" / "delivery" / "issue-map.json").read_text())
AGENT = {"api": "api-engineer", "mobile": "flutter-engineer", "web": "web-engineer", "dashboard": "dashboard-engineer",
         "design": "uiux-designer", "infra": "devops-engineer", "qa": "qa-engineer", "docs": None}
PATH_AGENT = [("services/api", "api-engineer"), ("apps/mobile", "flutter-engineer"), ("apps/web", "web-engineer"),
              ("apps/dashboard", "dashboard-engineer"), ("infra", "devops-engineer"), (".github", "devops-engineer"),
              ("Figma", "uiux-designer")]


def sh(*args, check=True):
    return subprocess.run(args, capture_output=True, text=True, check=check).stdout.strip()


def resolve(arg):
    plan = backlog.load()
    if arg.lstrip("#").isdigit():
        n = int(arg.lstrip("#"))
        key = next((k for k, v in MAP["issues"].items() if v["number"] == n), None)
    else:
        key = arg.upper()
    if key not in plan.tasks:
        sys.exit(f"{arg}: not a task in docs/delivery (epics are not worked on directly)")
    return plan, plan.tasks[key], MAP["issues"][key]


def agents_for(t):
    where = t.sections.get("Where", "")
    found = [a for p, a in PATH_AGENT if p in where]
    main = AGENT[t.meta["area"]]
    out = ([main] if main else []) + [a for a in found if a != main]
    return list(dict.fromkeys(out)) or [None]


def branch_for(t, n):
    body = sh("gh", "issue", "view", str(n), "-R", REPO, "--json", "body", "-q", ".body")
    m = re.search(r"Branch: `([^`]+)`", body)
    return m.group(1) if m else f"feature/{n}-{t.key.lower()}"


def info(arg):
    plan, t, rec = resolve(arg)
    deps = []
    for d in t.list_meta("depends"):
        dn = MAP["issues"][d]["number"]
        state = sh("gh", "issue", "view", str(dn), "-R", REPO, "--json", "state", "-q", ".state")
        deps.append({"key": d, "issue": dn, "closed": state == "CLOSED"})
    print(json.dumps({
        "key": t.key, "issue": rec["number"], "title": t.title, "sprint": t.sprint, "area": t.meta["area"],
        "size": t.meta["size"], "agents": agents_for(t), "reviewer": "reviewer",
        "branch": branch_for(t, rec["number"]), "plan_file": f"docs/delivery/sprints/{t.file}",
        "blocked_by": deps, "ready": all(d["closed"] for d in deps),
    }, indent=1, ensure_ascii=False))


def move(arg, status):
    _, t, rec = resolve(arg)
    p = MAP["project"]
    f = p["fields"]["Status"]
    if status not in f["options"]:
        sys.exit(f"status must be one of {list(f['options'])}")
    if not rec.get("item"):
        sys.exit("issue is not on the board; run tools/backlog/sync.py")
    sh("gh", "project", "item-edit", "--project-id", p["id"], "--id", rec["item"],
       "--field-id", f["id"], "--single-select-option-id", f["options"][status])
    print(f"#{rec['number']} {t.key} → {status}")


def start(arg):
    _, t, rec = resolve(arg)
    n = str(rec["number"])
    sh("gh", "issue", "edit", n, "-R", REPO, "--add-assignee", "@me")
    move(arg, "In Progress")
    br = branch_for(t, rec["number"])
    sh("git", "fetch", "origin", "develop")
    exists = sh("git", "branch", "--list", br)
    sh("git", "switch", br) if exists else sh("git", "switch", "-c", br, "origin/develop")
    print(f"branch {br} ready")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cmd, arg = sys.argv[1], sys.argv[2]
    {"info": lambda: info(arg), "move": lambda: move(arg, " ".join(sys.argv[3:])), "start": lambda: start(arg)}[cmd]()
