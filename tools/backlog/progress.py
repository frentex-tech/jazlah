#!/usr/bin/env python3
"""Build the management progress dashboard.

Outputs:
  * site/index.html: the dashboard web page (published to GitHub Pages by .github/workflows/progress-dashboard.yml)
  * the pinned dashboard issue body (a short summary + link to the page)

Usage:
  python3 tools/backlog/progress.py                  # write site/index.html and update the pinned issue
  python3 tools/backlog/progress.py --html-only      # only write site/index.html (local preview)
Progress is weighted by task size (XS=1, S=2, M=3, L=5, XL=8), read from the plan files.
"""
import html
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import backlog  # noqa: E402

REPO = os.environ.get("GITHUB_REPOSITORY", "frentex-tech/jazlah")
OWNER = REPO.split("/")[0]
WEIGHT = {"XS": 1, "S": 2, "M": 3, "L": 5, "XL": 8}
MAP_FILE = backlog.ROOT / "docs" / "delivery" / "issue-map.json"
OUT = backlog.ROOT / "site" / "index.html"
PAGE_URL = f"https://{OWNER}.github.io/{REPO.split('/')[1]}/"
AREA_AR = {"api": "Backend", "mobile": "Mobile App", "web": "Website", "dashboard": "Dashboards",
           "design": "UI/UX Design", "infra": "DevOps", "qa": "QA", "docs": "Docs"}


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


def collect():
    plan = backlog.load()
    state = json.loads(MAP_FILE.read_text())
    issues = {i["number"]: i for i in paged(f"repos/{REPO}/issues?state=all") if "pull_request" not in i}
    key_of = {v["number"]: k for k, v in state["issues"].items()}
    iss = {k: issues.get(v["number"]) for k, v in state["issues"].items()}
    now = datetime.now(timezone.utc)
    week = (now - timedelta(days=7)).isoformat()

    def closed(k):
        i = iss.get(k)
        return bool(i) and i["state"] == "closed" and i.get("state_reason") != "not_planned"

    def w(ts):
        return sum(WEIGHT[t.meta["size"]] for t in ts)

    def pct(ts):
        tot = w(ts)
        return round(100 * w([t for t in ts if closed(t.key)]) / tot) if tot else 0

    launch_names = [s.name for s in plan.sprints if not s.name.startswith("Post-launch")]
    lt = [t for t in plan.tasks.values() if t.sprint in launch_names]
    current = next((s for s in launch_names if any(not closed(t.key) for t in lt if t.sprint == s)), None)

    sprints = []
    for i, s in enumerate(plan.sprints):
        ts = [t for t in plan.tasks.values() if t.sprint == s.name]
        p = pct(ts)
        status = "done" if p == 100 else "current" if s.name == current else ("active" if p else "planned")
        title = s.name.split(" — ", 1)
        sprints.append({"n": title[0], "name": title[1] if len(title) > 1 else "", "pct": p, "status": status,
                        "done": sum(closed(t.key) for t in ts), "total": len(ts), "post": s.name.startswith("Post-launch")})

    epics = []
    for e in plan.epics.values():
        if e.key == "REL":
            continue
        ts = e.tasks
        epics.append({"key": e.key, "title": e.title, "pct": pct(ts), "done": sum(closed(t.key) for t in ts),
                      "total": len(ts), "sprint": e.sprints[0].split(" — ")[0],
                      "post": e.sprints[0].startswith("Post-launch")})

    areas = []
    for a in AREA_AR:
        ts = [t for t in lt if t.meta["area"] == a]
        if ts:
            areas.append({"area": AREA_AR[a], "pct": pct(ts), "done": sum(closed(t.key) for t in ts), "total": len(ts)})

    pulls = paged(f"repos/{REPO}/pulls?state=all")
    merged = [p for p in pulls if p.get("merged_at")]
    open_prs = [p for p in pulls if p["state"] == "open"]
    people = sorted({p["user"]["login"] for p in pulls} |
                    {a["login"] for i in issues.values() for a in i.get("assignees", [])})
    team = []
    for u in people:
        mine = [i for i in issues.values() if i["number"] in key_of and key_of[i["number"]] in plan.tasks
                and any(a["login"] == u for a in i.get("assignees", []))]
        done = [i for i in mine if i["state"] == "closed"]
        team.append({"login": u, "done": len(done), "open": len(mine) - len(done),
                     "points": sum(WEIGHT[plan.tasks[key_of[i["number"]]].meta["size"]] for i in done),
                     "prs": sum(1 for p in merged if p["user"]["login"] == u),
                     "prs_week": sum(1 for p in merged if p["user"]["login"] == u and p["merged_at"] >= week)})

    def row(i):
        k = key_of.get(i["number"])
        t = plan.tasks.get(k)
        return {"n": i["number"], "title": t.title if t else i["title"], "key": k or "",
                "area": AREA_AR.get(t.meta["area"], "") if t else "", "url": i["html_url"],
                "who": ", ".join(a["login"] for a in i.get("assignees", [])), "at": (i.get("closed_at") or "")[:10]}

    task_issues = [i for i in issues.values() if i["number"] in key_of and key_of[i["number"]] in plan.tasks]
    in_progress = [row(i) for i in task_issues if i["state"] == "open" and i.get("assignees")]
    recent = sorted([i for i in task_issues if i["state"] == "closed" and (i.get("closed_at") or "") >= week],
                    key=lambda x: x["closed_at"], reverse=True)
    launch_keys = {t.key for t in lt}
    waiting = [row(i) for i in task_issues if i["state"] == "open" and key_of[i["number"]] in launch_keys
               and any(l["name"] in ("needs-client", "blocked") for l in i["labels"])]

    return {
        "updated": now, "overall": pct(lt), "done": sum(closed(t.key) for t in lt), "total": len(lt),
        "current": current, "sprints": sprints, "epics": epics, "areas": areas, "team": team,
        "in_progress": in_progress, "recent": [row(i) for i in recent[:20]], "waiting": waiting,
        "open_prs": [{"n": p["number"], "title": p["title"], "url": p["html_url"], "who": p["user"]["login"]} for p in open_prs],
        "merged_week": sum(1 for p in merged if p["merged_at"] >= week),
        "board": f"https://github.com/orgs/{OWNER}/projects/{state.get('project', {}).get('number', '')}",
    }


# ---------------------------------------------------------------- HTML
CSS = """
:root{--brand:#4A1014;--brand2:#6A1A20;--deep:#240709;--gold:#C99A52;--goldl:#D9AE62;--ember:#8E1F26;
--bg:#F7F0E8;--paper:#FFFBF7;--sand:#EEDFD3;--line:#E9D9CD;--ink:#2A1215;--ink2:#55383A;--muted:#8E7470;--ok:#3F7A4E}
*{box-sizing:border-box}body{margin:0;font-family:'Readex Pro',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
a{color:inherit}.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
header{background:radial-gradient(1200px 400px at 85% -20%,#6A1A20 0,transparent 60%),linear-gradient(135deg,var(--deep),var(--brand));color:#F7F0E8;padding:36px 0 90px}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.logo{font-family:'El Messiri',serif;font-size:40px;font-weight:700;color:var(--goldl);line-height:1}
.logo small{display:block;font-family:'Readex Pro';font-size:13px;color:#E9CCC6;font-weight:400;margin-top:6px;letter-spacing:.3px}
.pill{display:inline-flex;gap:8px;align-items:center;border:1px solid rgba(217,174,98,.45);color:var(--goldl);padding:7px 14px;border-radius:999px;font-size:13px;text-decoration:none}
.hero{display:grid;grid-template-columns:220px 1fr;gap:36px;align-items:center;margin-top:34px}
.ring{width:200px;height:200px;border-radius:50%;display:grid;place-items:center;position:relative}
.ring .in{width:158px;height:158px;border-radius:50%;background:var(--deep);display:grid;place-items:center;text-align:center}
.ring b{font-family:'El Messiri';font-size:52px;color:var(--goldl);line-height:1}.ring span{font-size:12px;color:#E9CCC6}
.hero h1{font-family:'El Messiri';font-size:34px;margin:0 0 8px}.hero p{margin:0;color:#E9CCC6;line-height:1.8}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:-60px}
.kpi{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:18px 20px;box-shadow:0 8px 24px -14px rgba(42,18,21,.25)}
.kpi b{display:block;font-family:'El Messiri';font-size:30px;color:var(--brand)}.kpi span{font-size:13px;color:var(--muted)}
section{margin:34px 0}h2{font-family:'El Messiri';font-size:24px;margin:0 0 14px;color:var(--brand)}
h2 small{font-family:'Readex Pro';font-size:13px;color:var(--muted);font-weight:400;margin-inline-start:8px}
.card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:18px 20px}
.bar{height:10px;background:var(--sand);border-radius:99px;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--ember));border-radius:99px}
.timeline{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.sp{position:relative}.sp .n{font-size:12px;color:var(--muted)}.sp h3{font-size:15px;margin:4px 0 12px;line-height:1.6;min-height:48px}
.sp .meta{display:flex;justify-content:space-between;font-size:12px;color:var(--ink2);margin-top:8px}
.sp.current{border:2px solid var(--gold)}.sp.done{background:#F2F7F3;border-color:#CFE3D4}.sp.post{opacity:.75}
.tag{font-size:11px;padding:3px 9px;border-radius:99px;background:var(--sand);color:var(--ink2)}
.tag.current{background:var(--gold);color:var(--deep)}.tag.done{background:var(--ok);color:#fff}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.mods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.mod{padding:12px 14px}.mod div{display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;gap:8px}.mod em{font-style:normal;color:var(--muted);font-size:12px}
table{width:100%;border-collapse:collapse;font-size:14px}th{font-weight:500;color:var(--muted);font-size:12px;text-align:start;padding:8px 6px;border-bottom:1px solid var(--line)}
td{padding:10px 6px;border-bottom:1px solid var(--line)}tr:last-child td{border:0}
.list{list-style:none;margin:0;padding:0}.list li{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}
.list li:last-child{border:0}.list a{text-decoration:none}.list a:hover{color:var(--ember)}.muted{color:var(--muted);font-size:12px}
.empty{color:var(--muted);font-size:14px;padding:8px 0}
footer{padding:30px 0 50px;color:var(--muted);font-size:12px;text-align:center}
@media(max-width:900px){.hero{grid-template-columns:1fr}.kpis,.timeline{grid-template-columns:1fr 1fr}.grid2,.mods{grid-template-columns:1fr}}
"""


def esc(s):
    return html.escape(str(s))


def bar(p):
    return f'<div class="bar"><i style="width:{p}%"></i></div>'


def render_html(d):
    ring = f"background:conic-gradient(var(--gold) {d['overall'] * 3.6}deg, rgba(255,255,255,.12) 0)"
    status_txt = {"done": "Done ✓", "current": "Current Sprint", "active": "In Progress", "planned": "Planned"}
    sprints = "".join(
        f'<div class="card sp {s["status"]}{" post" if s["post"] else ""}"><div class="n">{esc(s["n"])}</div>'
        f'<h3><bdi>{esc(s["name"])}</bdi></h3>{bar(s["pct"])}<div class="meta"><span>{s["pct"]}% · {s["done"]}/{s["total"]} tasks</span>'
        f'<span class="tag {s["status"]}">{status_txt[s["status"]]}</span></div></div>' for s in d["sprints"])
    mods = "".join(
        f'<div class="card mod"><div><span>{esc(e["title"])}</span><em>{esc(e["sprint"])}</em></div>{bar(e["pct"])}'
        f'<div style="margin:8px 0 0"><em>{e["done"]}/{e["total"]} tasks</em><em>{e["pct"]}%</em></div></div>'
        for e in d["epics"] if not e["post"])
    areas = "".join(f'<tr><td>{esc(a["area"])}</td><td style="width:45%">{bar(a["pct"])}</td><td>{a["pct"]}%</td><td>{a["done"]}/{a["total"]}</td></tr>'
                    for a in d["areas"])
    team = "".join(f'<tr><td><a href="https://github.com/{esc(t["login"])}">@{esc(t["login"])}</a></td><td>{t["done"]}</td><td>{t["open"]}</td>'
                   f'<td>{t["prs"]}</td><td>{t["prs_week"]}</td><td>{t["points"]}</td></tr>' for t in d["team"]) \
        or '<tr><td colspan="6" class="empty">لسه مفيش شغل متسجّل. أول ما الفريق يبدأ هيظهر هنا.</td></tr>'

    def lst(items, empty, right):
        if not items:
            return f'<div class="empty">{empty}</div>'
        return '<ul class="list">' + "".join(
            f'<li><a href="{esc(i["url"])}">#{i["n"]} {esc(i["title"])}</a><span class="muted">{esc(right(i))}</span></li>' for i in items) + "</ul>"

    upd = d["updated"].astimezone(timezone(timedelta(hours=3))).strftime("%Y-%m-%d %H:%M")
    return f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jazlah — Project Dashboard</title><meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Readex+Pro:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<header><div class="wrap">
 <div class="top"><div class="logo">جزلة<small>Jazlah · Project Dashboard · Frentex Tech</small></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="pill" href="{esc(d['board'])}">Project Board ↗</a><a class="pill" href="https://github.com/{REPO}">Repository ↗</a></div></div>
 <div class="hero"><div class="ring" style="{ring}"><div class="in"><div><b>{d['overall']}%</b><br><span>Launch Progress</span></div></div></div>
 <div><h1><span class="muted" style="color:#E9CCC6;font-size:15px;font-family:Readex Pro">السبرنت الحالي</span><br><bdi>{esc(d['current'] or 'All launch sprints done 🎉')}</bdi></h1>
 <p>نسبة الإنجاز محسوبة على حجم كل مهمة لحد الإطلاق <bdi>(v1.0.0)</bdi>. الصفحة بتتحدّث أوتوماتيك كل يوم ومع كل مهمة بتخلص.<br>آخر تحديث: {upd} (توقيت الرياض)</p></div></div>
</div></header>
<main class="wrap">
 <div class="kpis">
  <div class="kpi"><b>{d['done']}/{d['total']}</b><span>Tasks Done (Launch)</span></div>
  <div class="kpi"><b>{len(d['in_progress'])}</b><span>Tasks In Progress</span></div>
  <div class="kpi"><b>{d['merged_week']}</b><span>PRs Merged · last 7 days</span></div>
  <div class="kpi"><b>{len(d['waiting'])}</b><span>Waiting on Client</span></div>
 </div>
 <section><h2>خطة المشروع<small><bdi>Roadmap · 7 Sprints → v1.0.0 + Post-launch</bdi></small></h2><div class="timeline">{sprints}</div></section>
 <section class="grid2">
  <div><h2>شغالين على إيه دلوقتي<small>In Progress</small></h2><div class="card">{lst(d['in_progress'], 'مفيش مهام شغالة حاليًا.', lambda i: f"{i['area']} · @{i['who']}")}</div></div>
  <div><h2>خلص آخر ٧ أيام<small>Completed</small></h2><div class="card">{lst(d['recent'], 'لسه مفيش مهام خلصت الأسبوع ده.', lambda i: f"{i['area']} · {i['at']}")}</div></div>
 </section>
 <section class="grid2">
  <div><h2>الفريق<small>Team Activity</small></h2><div class="card"><table><tr><th>Member</th><th>Done</th><th>Open</th><th>PRs</th><th>PRs (7d)</th><th>Points</th></tr>{team}</table></div></div>
  <div><h2>حسب الجزء<small>By Area</small></h2><div class="card"><table><tr><th>Area</th><th></th><th>%</th><th>Tasks</th></tr>{areas}</table></div></div>
 </section>
 <section><h2>مستني العميل<small>Waiting on Client / Blocked</small></h2><div class="card">{lst(d['waiting'], 'مفيش حاجة مستنية العميل 👍', lambda i: i['key'])}</div></section>
 <section><h2>تقدّم أجزاء النظام<small><bdi>Modules (Epics) · Launch scope</bdi></small></h2><div class="mods">{mods}</div></section>
</main>
<footer>Generated automatically from the project plan and GitHub · Frentex Tech</footer>
</body></html>"""


def render_issue(d):
    return "\n".join([
        "# 📊 Jazlah — Project progress",
        f"### 👉 **[Open the live dashboard]({PAGE_URL})**", "",
        f"**Launch progress:** {d['overall']}% · **{d['done']}/{d['total']}** tasks done · current: **{d['current'] or '—'}**",
        f"· in progress: {len(d['in_progress'])} · PRs merged (7 days): {d['merged_week']} · waiting on client: {len(d['waiting'])}", "",
        f"[Project board]({d['board']}) · updated {d['updated'].strftime('%Y-%m-%d %H:%M')} UTC",
        "", "<sub>Generated by tools/backlog/progress.py — do not edit.</sub>"])


def main():
    if not MAP_FILE.exists():
        print("issue-map.json missing; run tools/backlog/sync.py and commit the map")
        return
    d = collect()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render_html(d), encoding="utf-8")
    print(f"wrote {OUT}")
    if "--html-only" in sys.argv:
        return
    n = json.loads(MAP_FILE.read_text()).get("dashboard")
    if n:
        gh(f"repos/{REPO}/issues/{n}", "PATCH", {"body": render_issue(d)})
        print(f"dashboard issue #{n} updated")


if __name__ == "__main__":
    main()
