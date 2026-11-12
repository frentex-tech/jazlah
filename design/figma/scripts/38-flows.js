// The prototype flows (account first launch, order mobile + web, occasion, visit, cooking, Adha, feed + chat, vendor day, admin day).
// Screens live bare on pages 01..07 under their Arabic names; their old English name is plugin data `en`. This wires the click links,
// registers one flow starting point per flow on the page of its first screen, then validates every prototype link in the file.
// Order flow, mobile: Home -> Product -> Cart -> Checkout (pickup and day) -> Payment and review -> Order placed = 6 screens.
// Re-runnable: a tap replaces the node's previous reaction; stale flow starting points are cleared first.
await loadDS()
const T = (p, ms = 25000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))])
const out = []
const pageOf = pre => figma.root.children.find(p => p.name.startsWith(pre))
// step: [from, trigger, to] (English names = plugin data `en`). trigger: {b} button label | {nav} side-nav label | {row} first table row |
// {named} frame by name | {inst} first instance by name | {img: instance} photo inside the first such instance (fully inside the screen) | {bottom} bottom-most button
const FLOWS = [
  { name: "الحساب: أول تشغيل ← الملف الشخصي", page: "01", steps: [
    ["App/Onboarding/Slide 1 — Default", { b: "التالي" }, "App/Onboarding/Slide 2 — Default"],
    ["App/Onboarding/Slide 2 — Default", { b: "التالي" }, "App/Onboarding/Slide 3 — Default"],
    ["App/Onboarding/Slide 3 — Default", { b: "ابدأ الآن" }, "App/Login/Phone — Filled"],
    ["App/Login/Phone — Filled", { b: "إرسال الرمز" }, "App/Login/OTP — Filled"],
    ["App/Login/OTP — Filled", { b: "تأكيد" }, "App/Login/Profile — Filled"]] },
  { name: "الطلب: الرئيسية ← المنتج ← السلة ← الدفع ← تم الطلب", page: "02", steps: [
    ["App/Home/Home — Default", { img: "Product card" }, "App/Product/Detail — Default"],
    ["App/Product/Detail — Default", { b: "أضف إلى السلة" }, "App/Cart/Cart — Default"],
    ["App/Cart/Cart — Default", { bottom: true }, "App/Checkout/Fulfilment — Default"],
    ["App/Checkout/Fulfilment — Default", { bottom: true }, "App/Checkout/Payment — Filled"],
    ["App/Checkout/Payment — Filled", { bottom: true }, "App/Checkout/Placed — Default"]] },
  { name: "الطلب (ويب): الرئيسية ← المنتج ← السلة ← الدفع ← تم الطلب", page: "02", steps: [
    ["Web/Home/Home — Default", { inst: "Product card" }, "Web/Product/Detail — Default"],
    ["Web/Product/Detail — Default", { b: "أضف إلى السلة" }, "Web/Cart/Cart — Default"],
    ["Web/Cart/Cart — Default", { bottom: true }, "Web/Checkout/Fulfilment — Default"],
    ["Web/Checkout/Fulfilment — Default", { bottom: true }, "Web/Checkout/Payment — Filled"],
    ["Web/Checkout/Payment — Filled", { bottom: true }, "Web/Checkout/Placed — Default"]] },
  { name: "المناسبات: الطلب ← العرض ← العربون", page: "04", steps: [
    ["App/Occasions/Wizard/Type — Filled", { b: "التالي" }, "App/Occasions/Wizard/Details — Filled"],
    ["App/Occasions/Wizard/Details — Filled", { b: "التالي" }, "App/Occasions/Wizard/Date — Filled"],
    ["App/Occasions/Wizard/Date — Filled", { b: "إرسال الطلب" }, "App/Occasions/Quote — Default"],
    ["App/Occasions/Quote — Default", { b: "قبول العرض" }, "App/Occasions/Payment — Default"]] },
  { name: "زيارة المزرعة: الحجز ← التأكيد", page: "03", steps: [
    ["App/Visits/Booking — Filled", { b: "تأكيد الحجز" }, "App/Visits/Detail — Default"]] },
  { name: "الطبخ: الأطباق ← اطبخها لي", page: "04", steps: [
    ["App/Cooking/Dishes — Default", { named: "dishes" }, "App/Cooking/CookItForMe — Filled"]] },
  { name: "الأضاحي: الصفحة ← اليوم ← التقطيع", page: "04", steps: [
    ["App/Adha/Landing — Default", { b: "احجز أضحيتك" }, "App/Adha/DayPicker — Filled"],
    ["App/Adha/DayPicker — Filled", { b: "التالي" }, "App/Adha/Cuts — Filled"]] },
  { name: "سوق الأعلاف: الإعلانات ← الإعلان ← المحادثة", page: "05", steps: [
    ["App/Feed/Home — Default", { named: "listing card" }, "App/Feed/Listing — Default"],
    ["App/Feed/Listing — Default", { b: "ابدأ محادثة" }, "App/Feed/Chat — Default"]] },
  { name: "يوم البائع: اللوحة ← وقت الذبح ← الصور ← الملصق ← الأرباح", page: "06", steps: [
    ["Vendor/Orders/Board — Default", { b: "تحديد وقت الذبح" }, "Vendor/Orders/Board — Slaughter time picker"],
    ["Vendor/Orders/Board — Slaughter time picker", { bottom: true }, "Vendor/Orders/Board — Freshness upload — filled"],
    ["Vendor/Orders/Board — Freshness upload — filled", { bottom: true }, "Vendor/Orders/Label — Default"],
    ["Vendor/Orders/Label — Default", { nav: "الأرباح" }, "Vendor/Earnings/Summary — Default"]] },
  { name: "يوم الإدارة: النظرة العامة ← الطلبات ← الشكاوى ← المالية", page: "07", steps: [
    ["Admin/Overview — Default", { nav: "الطلبات" }, "Admin/Orders/List — Default"],
    ["Admin/Orders/List — Default", { row: true }, "Admin/Orders/Detail — Default"],
    ["Admin/Orders/Detail — Default", { nav: "العملاء" }, "Admin/Complaints/Queue — Default"],
    ["Admin/Complaints/Queue — Default", { row: true }, "Admin/Complaints/Detail — Default"],
    ["Admin/Complaints/Detail — Default", { nav: "المالية" }, "Admin/Finance/Balances — Default"]] },
]
const hasImg = n => Array.isArray(n.fills) && n.fills.some(f => f.type === "IMAGE" && f.visible !== false)
const inside = (n, f) => { const a = n.absoluteBoundingBox, b = f.absoluteBoundingBox; return a && a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.width <= b.x + b.width + 1 && a.y + a.height <= b.y + b.height + 1 }
const trigger = (f, s) => {
  if (s.b) return findButton(f, s.b)
  if (s.nav) { const nav = f.findOne(n => n.type === "INSTANCE" && n.name === "Side nav"); return nav && nav.findOne(n => n.type === "TEXT" && n.characters === s.nav) }
  if (s.row) return f.findOne(n => n.type === "FRAME" && n.name === "row" && n.parent && n.parent.name === "table")
  if (s.named) return f.findOne(n => n.type === "FRAME" && n.name === s.named)
  if (s.inst) return f.findOne(n => n.type === "INSTANCE" && n.name === s.inst)
  if (s.img) { const c = f.findOne(n => n.type === "INSTANCE" && n.name === s.img); return c && (c.findAll(hasImg).find(n => inside(n, f)) || c) }
  if (s.bottom) { const bs = f.findAll(n => n.type === "INSTANCE" && n.name === "Button"); return bs.sort((a, b) => b.absoluteBoundingBox.y - a.absoluteBoundingBox.y)[0] }
  return f
}
for (const p of figma.root.children) if (/^0[1-7] /.test(p.name)) { await p.loadAsync(); p.flowStartingPoints = [] }
for (const fl of FLOWS) {
  const pg = pageOf(fl.page); await pg.loadAsync()
  const F = en => pg.children.find(x => x.type === "FRAME" && x.getSharedPluginData(NS, "en") === en)
  let ok = 0
  for (const [fn, sp, tn] of fl.steps) {
    const f = F(fn), to = F(tn)
    if (!f || !to) { out.push("MISSING " + (f ? tn : fn)); continue }
    const t = trigger(f, sp) || (sp.b || sp.nav ? null : f)
    if (!t) { out.push("NO TRIGGER " + JSON.stringify(sp) + " in " + fn); continue }
    try {
      if (t !== f && f.reactions.length) await f.setReactionsAsync([])
      if (sp.img) { const c = f.findOne(n => n.type === "INSTANCE" && n.name === sp.img); if (c && c !== t && c.reactions.length) await c.setReactionsAsync([]) }
      await T(tap(t, to)); ok++
    } catch (e) { out.push("FAIL " + fn + " " + e.message) }
  }
  const first = F(fl.steps[0][0]); if (first) flowStart(pg.name, first, fl.name)
  out.push(fl.name.slice(0, 14) + " links " + ok + "/" + fl.steps.length)
}
// validate every link: the destination exists and sits on the same page as its source
let links = 0; const broken = []
for (const p of figma.root.children) { if (!/^0[1-7] /.test(p.name)) continue
  for (const n of p.findAll(x => "reactions" in x && x.reactions.length > 0)) for (const r of n.reactions) for (const a of (r.actions || [r.action])) {
    if (!a || a.type !== "NODE") continue; links++
    const d = await figma.getNodeByIdAsync(a.destinationId); let q = d; while (q && q.type !== "PAGE") q = q.parent
    if (!d || q !== p) broken.push(p.name.slice(0, 2) + " " + n.name.slice(0, 20))
  } }
out.push("links " + links + ", broken " + broken.length + (broken.length ? ": " + broken.slice(0, 5).join(" | ") : ""))
print("FLOWS-BEGIN\n" + out.join("\n") + "\nFLOWS-END")
