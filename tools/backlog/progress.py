#!/usr/bin/env python3
"""Build the progress dashboard (pinned issue) for management.

Runs in GitHub Actions (.github/workflows/progress-dashboard.yml) with GITHUB_TOKEN, or locally with gh.
Progress is weighted by task size (XS=1, S=2, M=3, L=5, XL=8), read from the plan files.
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import backlog  # noqa: E402

REPO = os.environ.get("GITHUB_REPOSITORY", "frentex-tech/jazlah")
WEIGHT = {"XS": 1, "S": 2, "M": 3, "L": 5, "XL": 8}
MAP_FILE = backlog.ROOT / "docs" / "delivery" / "issue-map.json"


def gh(path, method="GET", body=None):
    args = ["gh", "api", "-X", method, path]
    if body is not None:
        args += ["--input", "-"]
    out = subprocess.run(args, input=json.dumps(body) if body else None, capture_output=True, text=True, check=True)
    return json.loads(out.stdout) if out.stdout.strip() else {}


def paged(path):
    res, page = [], 1
    while True:
        chunk = gh(f"{path}{'&' if '?' in path else '?'}per_page=100&page={page}")
        res += chunk
        if len(chunk) < 100:
            return res
        page += 1


def bar(pct, width=20):
    full = round(pct / 100 * width)
    return "█" * full + "░" * (width - full) + f" {pct:.0f}%"


def build():
    plan = backlog.load()
    state = json.loads(MAP_FILE.read_text())
    issues = {i["number"]: i for i in paged(f"repos/{REPO}/issues?state=all") if "pull_request" not in i}
    by_key = {k: issues.get(v["number"]) for k, v in state["issues"].items()}
    now = datetime.now(timezone.utc)
    week = now - timedelta(days=7)

    def closed(k):
        i = by_key.get(k)
        return bool(i) and i["state"] == "closed" and i.get("state_reason") != "not_planned"

    launch = [s for s in plan.sprints if not s.name.startswith("Post-launch")]
    lt = [t for t in plan.tasks.values() if t.sprint in {s.name for s in launch}]
    tot_w = sum(WEIGHT[t.meta["size"]] for t in lt)
    done_w = sum(WEIGHT[t.meta["size"]] for t in lt if closed(t.key))
    overall = 100 * done_w / tot_w if tot_w else 0
    current = next((s for s in launch if any(not closed(t.key) for t in plan.tasks.values() if t.sprint == s.name)), None)

    L = ["# 📊 Jazlah — Project progress",
         f"_Updated automatically: {now.strftime('%Y-%m-%d %H:%M')} UTC · weighted by task size · "
         f"[Board](https://github.com/orgs/{REPO.split('/')[0]}/projects/{state.get('project', {}).get('number', '')}) · "
         f"[Plan](https://github.com/{REPO}/tree/develop/docs/delivery)_", "",
         f"## Launch (v1.0.0): `{bar(overall)}`",
         f"**{sum(closed(t.key) for t in lt)} / {len(lt)}** tasks done · current sprint: **{current.name if current else 'All launch sprints done 🎉'}**", "",
         "## Sprints", "", "| Sprint | Progress | Tasks done | Open P0 | Status |", "|---|---|---|---|---|"]
    for s in plan.sprints:
        ts = [t for t in plan.tasks.values() if t.sprint == s.name]
        w = sum(WEIGHT[t.meta["size"]] for t in ts)
        d = sum(WEIGHT[t.meta["size"]] for t in ts if closed(t.key))
        pct = 100 * d / w if w else 0
        p0 = sum(1 for t in ts if t.meta["prio"] == "P0" and not closed(t.key))
        status = "✅ Done" if pct == 100 else ("🔄 In progress" if s is current or d else "⏳ Planned")
        L.append(f"| {s.name} | `{bar(pct, 12)}` | {sum(closed(t.key) for t in ts)}/{len(ts)} | {p0} | {status} |")

    # team activity
    pulls = paged(f"repos/{REPO}/pulls?state=closed&base=develop") + paged(f"repos/{REPO}/pulls?state=closed&base=main")
    merged = [p for p in pulls if p.get("merged_at")]
    people = sorted({p["user"]["login"] for p in merged} |
                    {a["login"] for i in issues.values() for a in i.get("assignees", [])})
    L += ["", "## Team", "", "| Member | Tasks done | Tasks open (assigned) | PRs merged | PRs merged (7 days) | Size points done |",
          "|---|---|---|---|---|---|"]
    key_of = {v["number"]: k for k, v in state["issues"].items()}
    for u in people:
        mine = [i for i in issues.values() if any(a["login"] == u for a in i.get("assignees", [])) and i["number"] in key_of
                and key_of[i["number"]] in plan.tasks]
        done = [i for i in mine if i["state"] == "closed"]
        pts = sum(WEIGHT[plan.tasks[key_of[i["number"]]].meta["size"]] for i in done)
        pm = [p for p in merged if p["user"]["login"] == u]
        pw = [p for p in pm if p["merged_at"] >= week.isoformat()]
        L.append(f"| @{u} | {len(done)} | {len(mine) - len(done)} | {len(pm)} | {len(pw)} | {pts} |")
    if not people:
        L.append("| — | No assigned or merged work yet. Assign yourself when you start a task. | | | | |")

    blockers = [i for i in issues.values() if i["state"] == "open"
                and any(l["name"] in ("needs-client", "blocked") for l in i["labels"])]
    L += ["", "## Waiting on the client / blocked", ""]
    L += [f"- #{i['number']} {i['title']} — {', '.join(l['name'] for l in i['labels'] if l['name'] in ('needs-client', 'blocked'))}"
          for i in sorted(blockers, key=lambda x: x["number"])] or ["- Nothing blocked 👍"]

    recent = sorted([i for i in issues.values() if i["state"] == "closed" and i.get("closed_at", "") >= week.isoformat()
                     and i["number"] in key_of], key=lambda x: x["closed_at"], reverse=True)
    L += ["", "## Completed in the last 7 days", ""]
    L += [f"- #{i['number']} {i['title']}" + (f" — @{i['assignees'][0]['login']}" if i.get("assignees") else "") for i in recent[:30]] \
        or ["- Nothing closed this week yet"]
    L += ["", "<sub>Generated by `tools/backlog/progress.py`. Do not edit by hand — changes are overwritten daily.</sub>"]
    return "\n".join(L), state


def main():
    if not MAP_FILE.exists():
        print("issue-map.json not on this branch yet; run tools/backlog/sync.py and commit the map to develop")
        return
    body, state = build()
    n = state.get("dashboard")
    if "--print" in sys.argv or not n:
        print(body)
        return
    gh(f"repos/{REPO}/issues/{n}", "PATCH", {"body": body})
    print(f"dashboard #{n} updated")


if __name__ == "__main__":
    main()
