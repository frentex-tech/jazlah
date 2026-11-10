// QA lint over every screen frame (names "App/…", "Web/…", "Admin/…" on pages 10, 20, 30). Prints counts and the first examples:
// "undefined"/empty text, leftover component placeholders, Arabic text under 14 with 3+ words, text outside its screen,
// text wider than its frame (clipped), fills not bound to a variable, screens missing a state suffix.
const PAGES = ["10 Customer App", "20 Customer Web", "30 Admin"]
const PLACE = ["نص مساعد", "اكتب هنا", "المحتوى", "عنوان البطاقة", "نص توضيحي قصير يصف محتوى البطاقة.", "عنوان الصفحة"]
const res = { screens: 0, undefinedTxt: [], placeholder: [], smallAr: [], outside: [], unbound: [], noState: [] }
const push = (a, s) => { if (a.length < 6) a.push(s) }
for (const pn of PAGES) {
  const pg = figma.root.children.find(p => p.name === pn); await pg.loadAsync()
  const screens = pg.findAll(n => n.type === "FRAME" && /^(App|Web|Admin)\//.test(n.name) && n.parent && n.parent.type === "SECTION")
  for (const s of screens) {
    res.screens++
    if (!/ — /.test(s.name)) push(res.noState, s.name)
    const sb = s.absoluteBoundingBox
    for (const t of s.findAll(n => n.type === "TEXT")) {
      const c = t.characters
      if (/undefined|null|NaN/.test(c) || c.trim() === "") push(res.undefinedTxt, s.name + ": '" + c.slice(0, 20) + "'")
      if (PLACE.includes(c) && !/(Input|Card|Header|Sheet)/.test(t.parent.name + t.parent.parent.name) ) push(res.placeholder, s.name + ": " + c)
      const fs = t.fontSize
      if (typeof fs === "number" && fs < 14 && /[؀-ۿ]/.test(c) && c.split(/\s+/).length >= 3) push(res.smallAr, s.name + ": " + c.slice(0, 24) + " (" + fs + ")")
      const b = t.absoluteBoundingBox
      if (b && sb && t.visible && (b.x < sb.x - 1 || b.x + b.width > sb.x + sb.width + 1)) push(res.outside, s.name + ": " + c.slice(0, 18))
    }
    for (const n of s.findAll(x => "fills" in x && x.visible !== false && x.type !== "TEXT")) {
      if (Array.isArray(n.fills) && n.fills.some(f => f.type === "SOLID" && f.visible !== false && !(n.boundVariables && n.boundVariables.fills))) { push(res.unbound, s.name + " > " + n.name); break }
    }
  }
}
const line = (k, a) => k + ": " + (a.length ? a.length + "+ e.g. " + a.slice(0, 4).join(" | ") : "none")
print(["LINT screens=" + res.screens, line("undefined/empty", res.undefinedTxt), line("placeholder", res.placeholder), line("small-arabic", res.smallAr), line("outside", res.outside), line("unbound-fill", res.unbound), line("no-state-suffix", res.noState)].join("\n"))
