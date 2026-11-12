// One-time repairs found in the eye review of pages 01..07 and Design System (already applied to the file; idempotent where it can be):
// 1. dashboard screens: the Side nav fills the full height of the screen
// 2. dashboard screens shrink to their content (minimum 720 high; screens with a dialog keep room for it); scrims follow the new height
// 3. "إنشاء حملة · تم الإرسال": was an empty card with a toast, now the filled form with the toast on top
// 4. Design System: sections of each column are stacked with an even 200 gap
const out = []
let nav = 0, shrunk = 0, scr = 0
for (const p of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await p.loadAsync()
  for (const s of p.children.filter(x => x.type === "FRAME")) {
    const sn = s.children.find(c => c.type === "INSTANCE" && c.name === "Side nav")
    if (!sn || s.layoutMode !== "HORIZONTAL") continue
    if (sn.layoutSizingVertical !== "FILL") { sn.layoutSizingVertical = "FILL"; nav++ }
    const main = s.children.find(c => c.name === "main"), ct = main && main.children.find(c => c.name === "content"); if (!ct) continue
    const abs = s.children.filter(c => c.layoutPositioning === "ABSOLUTE"), oldH = s.height, y0 = s.absoluteBoundingBox.y
    let b = 0
    for (const x of ct.findAll(q => q.visible !== false && (q.type === "TEXT" || q.type === "INSTANCE" || (q.type === "FRAME" && q.layoutSizingVertical !== "FILL" && Array.isArray(q.fills) && q.fills.length > 0)))) {
      const a = x.absoluteBoundingBox; if (a && a.height < 600) b = Math.max(b, a.y + a.height - y0)
    }
    const lowest = Math.max(0, ...abs.filter(c => c.height < oldH - 2).map(c => c.y + c.height))
    const target = Math.max(720, Math.ceil(b + 96), Math.ceil(lowest + 40))
    if (target < oldH - 60) { s.resize(s.width, target); shrunk++ }
    for (const c of abs) if (c.width >= s.width - 2 && c.x <= 1 && c.y <= 1 && c.height > s.height * 0.5 && Math.abs(c.height - s.height) > 2) { c.resize(c.width, s.height); scr++ }
  }
}
out.push("nav " + nav + ", shrunk " + shrunk + ", scrims " + scr)
const p7 = figma.root.children.find(p => p.name.startsWith("07")); await p7.loadAsync()
const sent = p7.children.find(n => n.name === "إنشاء حملة · تم الإرسال"), filled = p7.children.find(n => n.name === "إنشاء حملة · معبّأة")
if (sent && filled && !sent.findOne(n => n.name === "label" && n.type === "TEXT" && n.characters === "حملة جديدة" && false)) {
  const toast = sent.findOne(n => n.type === "INSTANCE" && /toast/i.test(n.name))
  if (toast && sent.children.length < filled.children.length + 2 && !sent.findOne(n => n.type === "TEXT" && n.characters.startsWith("تفاصيل الحملة"))) {
    const c = filled.clone(); p7.insertChild(p7.children.indexOf(sent), c); c.x = sent.x; c.y = sent.y
    for (const k of ["en", "blk", "row", "ar"]) c.setSharedPluginData(NS, k, sent.getSharedPluginData(NS, k))
    c.name = sent.name; const t = toast.clone(); c.appendChild(t); t.layoutPositioning = "ABSOLUTE"; t.x = Math.round((c.width - 260 - t.width) / 2); t.y = 84
    sent.remove(); out.push("campaign sent screen rebuilt")
  }
}
const ds = figma.root.children.find(p => p.name === "Design System"); await ds.loadAsync()
const cols = {}; for (const n of ds.children) (cols[Math.round(n.x)] = cols[Math.round(n.x)] || []).push(n)
for (const k of Object.keys(cols)) { let y = 0; for (const n of cols[k].sort((a, b) => a.y - b.y)) { n.y = y; y += Math.ceil(n.height) + 200 } }
out.push("design system columns " + Object.keys(cols).length)
print("FIX89 " + out.join(" | "))
