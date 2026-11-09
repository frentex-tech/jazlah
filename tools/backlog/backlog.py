"""Parse and validate the delivery plan in docs/delivery/sprints/*.md.

The format is documented in docs/delivery/README.md. Standard library only (Python 3.9+).
"""
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
SPRINTS_DIR = ROOT / "docs" / "delivery" / "sprints"
REQS_FILE = ROOT / "docs" / "requirements.md"

SECTIONS = ["What", "Output", "How", "Where", "Acceptance"]
AREAS = {"api", "mobile", "web", "dashboard", "design", "infra", "qa", "docs"}
SIZES = ["XS", "S", "M", "L", "XL"]
PRIOS = {"P0", "P1", "P2"}
TYPES = {"Feature", "Task"}
LABELS_ALLOWED = {"needs-client", "spike", "security", "tech-debt"}
KEY_RE = r"[A-Z]{2,4}-[A-Z]{2,3}-\d+"


@dataclass
class Task:
    key: str
    title: str
    meta: Dict[str, str]
    sections: Dict[str, str]
    epic: str = ""
    sprint: str = ""
    file: str = ""

    def list_meta(self, name: str) -> List[str]:
        return [x.strip() for x in self.meta.get(name, "").split(",") if x.strip()]


@dataclass
class Epic:
    key: str
    title: str
    reqs: List[str]
    summary: str
    sprints: List[str] = field(default_factory=list)
    tasks: List[Task] = field(default_factory=list)


@dataclass
class Sprint:
    name: str  # milestone title, e.g. "Sprint 1 — Foundation"
    file: str
    header: str  # everything before the first epic (goal, exit criteria, merge points)
    order: int


@dataclass
class Plan:
    sprints: List[Sprint]
    epics: Dict[str, Epic]
    tasks: Dict[str, Task]


def _parse_meta(line: str) -> Dict[str, str]:
    meta = {}
    for part in line.strip().strip("`").split("·"):
        if ":" in part:
            k, v = part.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


def _parse_sections(body: str) -> Dict[str, str]:
    out: Dict[str, str] = {}
    pattern = re.compile(r"^\*\*(%s):\*\*" % "|".join(SECTIONS), re.M)
    marks = list(pattern.finditer(body))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(body)
        out[m.group(1)] = body[m.end():end].strip()
    return out


def parse_file(path: Path, order: int):
    text = path.read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    first_epic = re.search(r"^## EPIC ", text, re.M)
    header = text[: first_epic.start()] if first_epic else text
    header = header.split("\n", 1)[1].strip() if "\n" in header else ""
    sprint = Sprint(name=title, file=path.name, header=header, order=order)
    epics: List[Epic] = []
    tasks: List[Task] = []
    for eb in re.split(r"^(?=## EPIC )", text, flags=re.M)[1:]:
        m = re.match(r"## EPIC (\S+) — (.+)", eb)
        ekey, etitle = m.group(1), m.group(2).strip()
        parts = re.split(r"^(?=### )", eb, flags=re.M)
        ehead = parts[0].split("\n", 1)[1] if "\n" in parts[0] else ""
        rm = re.search(r"^- reqs: (.+)$", ehead, re.M)
        reqs = [x.strip() for x in rm.group(1).split(",")] if rm else []
        summary = re.sub(r"^- reqs: .+$", "", ehead, flags=re.M).strip()
        epics.append(Epic(ekey, etitle, reqs, summary, [title]))
        for tb in parts[1:]:
            tm = re.match(r"### (%s) — (.+)\n" % KEY_RE, tb)
            if not tm:
                raise ValueError(f"{path.name}: bad task heading: {tb.splitlines()[0]}")
            rest = tb[tm.end():]
            meta_line = rest.lstrip().split("\n", 1)[0]
            body = rest.lstrip().split("\n", 1)[1] if "\n" in rest.lstrip() else ""
            tasks.append(Task(tm.group(1), tm.group(2).strip(), _parse_meta(meta_line),
                              _parse_sections(body), ekey, title, path.name))
    return sprint, epics, tasks


def sprint_files() -> List[Path]:
    files = sorted(SPRINTS_DIR.glob("sprint-*.md"), key=lambda f: int(re.search(r"\d+", f.name).group()))
    post = SPRINTS_DIR / "post-launch.md"
    return files + ([post] if post.exists() else [])


def load() -> Plan:
    sprints, epics, tasks = [], {}, {}
    for i, f in enumerate(sprint_files()):
        s, es, ts = parse_file(f, i)
        sprints.append(s)
        for e in es:
            if e.key in epics:  # an epic may span sprints (e.g. REL)
                epics[e.key].sprints.append(s.name)
                epics[e.key].reqs += [r for r in e.reqs if r not in epics[e.key].reqs]
                epics[e.key].summary = epics[e.key].summary or e.summary
            else:
                epics[e.key] = e
        for t in ts:
            if t.key in tasks:
                raise ValueError(f"duplicate task key {t.key}")
            tasks[t.key] = t
            epics[t.epic].tasks.append(t)
    return Plan(sprints, epics, tasks)


def known_requirements() -> Dict[str, str]:
    text = REQS_FILE.read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"^### ((?:FR|NFR|INT)-[A-Z]+(?:-\d+)?)\n(.+)$", text, re.M):
        out[m.group(1)] = m.group(2).strip()
    return out


def validate(plan: Plan) -> List[str]:
    """Return a list of problems. Empty list = plan is consistent."""
    errs = []
    reqs = known_requirements()
    order = {s.name: s.order for s in plan.sprints}
    for t in plan.tasks.values():
        where = f"{t.file}:{t.key}"
        if not re.fullmatch(KEY_RE, t.key):
            errs.append(f"{where}: bad key")
        if not t.key.startswith(t.epic + "-") and t.epic not in ("REL",):
            # tasks may live in another epic only if the epic prefix matches; warn otherwise
            errs.append(f"{where}: key prefix does not match epic {t.epic}")
        if t.meta.get("type") not in TYPES:
            errs.append(f"{where}: type must be one of {TYPES}")
        if t.meta.get("area") not in AREAS:
            errs.append(f"{where}: area '{t.meta.get('area')}' unknown")
        if t.meta.get("size") not in SIZES:
            errs.append(f"{where}: size '{t.meta.get('size')}' unknown")
        if t.meta.get("prio") not in PRIOS:
            errs.append(f"{where}: prio '{t.meta.get('prio')}' unknown")
        for lb in t.list_meta("labels"):
            if lb not in LABELS_ALLOWED:
                errs.append(f"{where}: label '{lb}' not allowed (use one of {sorted(LABELS_ALLOWED)})")
        for s in ("What", "Output", "Where", "Acceptance"):
            if not t.sections.get(s):
                errs.append(f"{where}: missing **{s}:**")
        if "- [ ]" not in t.sections.get("Acceptance", ""):
            errs.append(f"{where}: acceptance needs '- [ ]' items")
        for r in t.list_meta("reqs"):
            if r not in reqs:
                errs.append(f"{where}: unknown requirement {r}")
        for d in t.list_meta("depends"):
            if d not in plan.tasks:
                errs.append(f"{where}: depends on unknown task {d}")
            elif order[plan.tasks[d].sprint] > order[t.sprint]:
                errs.append(f"{where}: depends on {d} which is in a LATER sprint ({plan.tasks[d].sprint})")
            elif d == t.key:
                errs.append(f"{where}: depends on itself")
    for e in plan.epics.values():
        for r in e.reqs:
            if r not in reqs:
                errs.append(f"epic {e.key}: unknown requirement {r}")
    # cycle check
    state: Dict[str, int] = {}

    def visit(k: str, stack: List[str]):
        if state.get(k) == 1:
            errs.append("dependency cycle: " + " -> ".join(stack + [k]))
            return
        if state.get(k) == 2 or k not in plan.tasks:
            return
        state[k] = 1
        for d in plan.tasks[k].list_meta("depends"):
            visit(d, stack + [k])
        state[k] = 2

    for k in plan.tasks:
        visit(k, [])
    # requirement coverage
    covered = {r for t in plan.tasks.values() for r in t.list_meta("reqs")}
    covered |= {r for e in plan.epics.values() for r in e.reqs}
    for r in reqs:
        if r not in covered:
            errs.append(f"requirement {r} is not covered by any task or epic")
    return errs


def dependents(plan: Plan) -> Dict[str, List[str]]:
    out: Dict[str, List[str]] = {k: [] for k in plan.tasks}
    for t in plan.tasks.values():
        for d in t.list_meta("depends"):
            if d in out:
                out[d].append(t.key)
    return out


if __name__ == "__main__":
    p = load()
    problems = validate(p)
    print(f"{len(p.sprints)} sprints, {len(p.epics)} epics, {len(p.tasks)} tasks")
    for x in problems:
        print("  -", x)
    raise SystemExit(1 if problems else 0)
