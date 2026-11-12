// DSN-DES-2: the 8 main prototype flows (order, occasion, visit, cooking, Adha, feed + chat, vendor day, admin day).
// Wires the click links between existing screens, registers one flow starting point per flow (on the page of its first screen),
// lists the 8 flows with start links on 90 Flows, then validates every prototype link in the file.
// Flow 1 (order) stops at checkout step 1: cart, payment and "order placed" screens are not designed yet.
// Re-runnable: a tap replaces the node's previous reaction; the 90 Flows index is rebuilt in place.
await loadDS()
const T = (p, ms = 25000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))])
const out = []
// step: [fromFrame, trigger, toFrame]. trigger: {b: button label} | {nav: side-nav label} | {row: true} | {named: frame name} | {card: true} | {bottom: true} | {} (the whole frame)
const FLOWS = [
  { name: "Regular order: home → product → checkout", page: "10 Customer App", steps: [
    ["App/Home/Home — Default", { inst: "Product card" }, "App/Product/Detail — Default"],
    ["App/Product/Detail — Default", { b: "أضف إلى السلة" }, "App/Checkout/Fulfilment — Default"]] },
  { name: "2 Occasion: wizard → quote → deposit", page: "10 Customer App", steps: [
    ["App/Occasions/Wizard/Type — Filled", { b: "التالي" }, "App/Occasions/Wizard/Details — Filled"],
    ["App/Occasions/Wizard/Details — Filled", { b: "التالي" }, "App/Occasions/Wizard/Date — Filled"],
    ["App/Occasions/Wizard/Date — Filled", { b: "إرسال الطلب" }, "App/Occasions/Quote — Default"],
    ["App/Occasions/Quote — Default", { b: "قبول العرض" }, "App/Occasions/Payment — Default"]] },
  { name: "3 Visit: booking → confirmation", page: "10 Customer App", steps: [
    ["App/Visits/Booking — Filled", { b: "تأكيد الحجز" }, "App/Visits/Detail — Default"]] },
  { name: "4 Cooking: dishes → cook it for me", page: "10 Customer App", steps: [
    ["App/Cooking/Dishes — Default", { named: "dishes" }, "App/Cooking/CookItForMe — Filled"]] },
  { name: "5 Adha: landing → day → cuts", page: "10 Customer App", steps: [
    ["App/Adha/Landing — Default", { b: "احجز أضحيتك" }, "App/Adha/DayPicker — Filled"],
    ["App/Adha/DayPicker — Filled", { b: "التالي" }, "App/Adha/Cuts — Filled"]] },
  { name: "6 Feed and chat: feed → listing → chat", page: "10 Customer App", steps: [
    ["App/Feed/Home — Default", { named: "listing card" }, "App/Feed/Listing — Default"],
    ["App/Feed/Listing — Default", { b: "ابدأ محادثة" }, "App/Feed/Chat — Default"]] },
  { name: "7 Vendor day: board → slaughter time → freshness → label → earnings", page: "31 Vendor", steps: [
    ["Vendor/Orders/Board — Default", { b: "تحديد وقت الذبح" }, "Vendor/Orders/Board — Slaughter time picker"],
    ["Vendor/Orders/Board — Slaughter time picker", { bottom: true }, "Vendor/Orders/Board — Freshness upload — filled"],
    ["Vendor/Orders/Board — Freshness upload — filled", { bottom: true }, "Vendor/Orders/Label — Default"],
    ["Vendor/Orders/Label — Default", { nav: "الأرباح" }, "Vendor/Earnings/Summary — Default"]] },
  { name: "8 Admin day: overview → orders → complaints → finance", page: "30 Admin", steps: [
    ["Admin/Overview — Default", { nav: "الطلبات" }, "Admin/Orders/List — Default"],
    ["Admin/Orders/List — Default", { row: true }, "Admin/Orders/Detail — Default"],
    ["Admin/Orders/Detail — Default", { nav: "العملاء" }, "Admin/Complaints/Queue — Default"],
    ["Admin/Complaints/Queue — Default", { row: true }, "Admin/Complaints/Detail — Default"],
    ["Admin/Complaints/Detail — Default", { nav: "المالية" }, "Admin/Finance/Balances — Default"]] },
]
const inSection = (pg, n) => pg.findOne(x => x.type === "FRAME" && x.name === n && x.parent && x.parent.type === "SECTION")
const trigger = (f, s) => {
  if (s.b) return findButton(f, s.b)
  if (s.nav) { const nav = f.findOne(n => n.type === "INSTANCE" && n.name === "Side nav"); return nav && nav.findOne(n => n.type === "TEXT" && n.characters === s.nav) }
  if (s.row) return f.findOne(n => n.type === "FRAME" && n.name === "row" && n.parent && n.parent.name === "table")
  if (s.inst) return f.findOne(n => n.type === "INSTANCE" && n.name === s.inst)
  if (s.named) return f.findOne(n => n.type === "FRAME" && n.name === s.named)
  if (s.card) return f.findOne(n => n.type === "INSTANCE" && /card|row/i.test(n.name))
  if (s.bottom) { const bs = f.findAll(n => n.type === "INSTANCE" && n.name === "Button"); return bs.sort((a, b) => b.absoluteBoundingBox.y - a.absoluteBoundingBox.y)[0] }
  return f
}
const starts = []
for (const fl of FLOWS) {
  const pg = page(fl.page); await pg.loadAsync()
  let ok = 0
  for (const [fn, sp, tn] of fl.steps) {
    const f = inSection(pg, fn), to = inSection(pg, tn)
    if (!f || !to) { out.push("MISSING frame " + (f ? tn : fn)); continue }
    const t = trigger(f, sp) || (sp.b || sp.nav ? null : f)
    if (!t) { out.push("NO TRIGGER " + JSON.stringify(sp) + " in " + fn); continue }
    try { if (t !== f && f.reactions.length) await f.setReactionsAsync([]); await T(tap(t, to)); ok++ } catch (e) { out.push("FAIL " + fn + " " + e.message) }
  }
  const first = inSection(pg, fl.steps[0][0]); if (first) { flowStart(fl.page, first, fl.name); starts.push([fl, first]) }
  out.push(fl.name.slice(0, 2) + " links " + ok + "/" + fl.steps.length)
}
// index on 90 Flows: one hyperlink per flow
const p90 = page("90 Flows"); await p90.loadAsync()
p90.findAll(n => n.getSharedPluginData(NS, "id") === "flows-index").forEach(n => n.remove())
const rows = starts.map(([fl, f]) => [fl.name, f])
const idx = frame("Prototype flows", { w: 900, pad: 32, gap: 14, fill: "paper", stroke: "line", r: "md" }); idx.setSharedPluginData(NS, "id", "flows-index")
add(idx, await txt("النماذج التفاعلية · Prototype flows (Present ▶)", "Heading/H2", "ink", { w: 836, align: "RIGHT" }), "h")
for (const [name, f] of rows) { if (!f) continue
  const t = await txt("▶ " + name, "Label/M", "ember", { w: 836, align: "RIGHT" }); add(idx, t, "h"); t.setRangeHyperlink(0, t.characters.length, { type: "NODE", value: f.id }) }
p90.appendChild(idx); const maxY = Math.max(...p90.children.filter(n => n !== idx).map(n => n.y + n.height)); idx.x = 0; idx.y = maxY + 200

// validate every prototype link in the file (screens, pages 10..32)
let links = 0, broken = []
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen"]) {
  const pg = page(pn); await pg.loadAsync()
  for (const n of pg.findAll(x => "reactions" in x && x.reactions.length > 0)) for (const r of n.reactions) for (const a of (r.actions || [r.action])) {
    if (!a || a.type !== "NODE") continue; links++
    const d = await figma.getNodeByIdAsync(a.destinationId); if (!d) broken.push(pn + " > " + n.name)
  }
}
out.push("links " + links + ", broken " + broken.length + (broken.length ? ": " + broken.slice(0, 5).join(" | ") : ""))
print("FLOWS-BEGIN\n" + out.join("\n") + "\nFLOWS-END")
