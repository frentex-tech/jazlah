// DSN-DES-2: client review page on 00 Cover. What to approve, the 8 prototype flows (each a link to its starting screen), counts, how to give feedback.
// Re-runnable: the section is rebuilt in place. Run after 38-flows.js (it reads the flow starting points).
await loadDS()
const P = "00 Cover"; const cover = page(P); await cover.loadAsync()
const ctx = { y: 0 }
const others = cover.children.filter(n => !(n.type === "SECTION" && n.getSharedPluginData(NS, "id") === "sec-client-review"))
ctx.y = others.length ? Math.max(...others.map(n => n.y + n.height)) + 200 : 0

// counts and flow starts from the file
let screens = 0, sections = 0; const starts = {}
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen"]) {
  const pg = page(pn); await pg.loadAsync()
  for (const s of pg.children.filter(n => n.type === "SECTION")) { sections++; screens += s.children.filter(n => n.type === "FRAME").length }
  for (const f of pg.flowStartingPoints) starts[f.name] = f.nodeId
}
const find = re => { const k = Object.keys(starts).find(n => re.test(n)); return k ? starts[k] : null }
const FLOWS = [
  ["1 الطلب العادي: الرئيسية ← المنتج ← الدفع (الخطوة 1)", find(/^Regular order/)],
  ["2 المناسبات: الطلب ← العرض ← العربون", find(/^2 Occasion/)],
  ["3 زيارة المزرعة: الحجز ← التأكيد", find(/^3 Visit/)],
  ["4 الطبخ: الأطباق ← اطبخها لي", find(/^4 Cooking/)],
  ["5 الأضاحي: الصفحة ← اليوم ← التقطيع", find(/^5 Adha/)],
  ["6 سوق الأعلاف: الإعلانات ← الإعلان ← المحادثة", find(/^6 Feed/)],
  ["7 يوم البائع: اللوحة ← وقت الذبح ← الصور ← الملصق ← الأرباح", find(/^7 Vendor/)],
  ["8 يوم الإدارة: النظرة العامة ← الطلبات ← الشكاوى ← المالية", find(/^8 Admin/)],
]
await screenSection(ctx, P, "sec-client-review", "مراجعة التصميم للعميل · Client design review", async S => {
  S.note = "مراجعة تصميم جزلة قبل بدء التنفيذ. الرحلات التفاعلية تعمل بزر Present (▶) في أعلى الصفحة."
  const W = 900, card = frame("review", { w: W, pad: 40, gap: 20, fill: "paper", stroke: "line", r: "md" })
  const h = async (s, style = "Heading/H2") => add(card, await txt(s, style, "ink", { w: W - 80, align: "RIGHT" }), "h")
  const p = async s => add(card, await txt(s, "Body/M", "ink-2", { w: W - 80, align: "RIGHT" }), "h")
  await h("ما المطلوب منك", "Heading/H1")
  await p("1. اعتماد اسم وشعار «جزلة / Jazlah» كتابيًا (ما زال بانتظار قرارك).")
  await p("2. اختيار الشعار المفضّل بين الخيارين A وB.")
  await p("3. تجربة الرحلات الثماني أدناه، ثم إرسال ملاحظاتك دفعة واحدة. الملاحظات الجديدة خارج متطلبات النظام تدخل سجل التغييرات.")
  await h("الرحلات التفاعلية (اضغط الرابط ثم Present)")
  for (const [name, id] of FLOWS) {
    const t = await txt("▶ " + name, "Label/M", "ember", { w: W - 80, align: "RIGHT" }); add(card, t, "h")
    if (id) t.setRangeHyperlink(0, t.characters.length, { type: "NODE", value: id })
  }
  await h("حجم التصميم")
  await p(sections + " قسمًا و" + screens + " شاشة بالعربية (RTL) بحالاتها: الافتراضية والتحميل والفارغة والخطأ والمعطّلة، لتطبيق العملاء وموقع العملاء ولوحات الإدارة والبائع والمطبخ. النسخة الإنجليزية (LTR) تُنتج بالعكس والترجمة، ومعروضة في صفحة 99 LTR Rules.")
  S.main.push(card)
})
print("CLIENT sections=" + sections + " screens=" + screens + " flows=" + FLOWS.filter(f => f[1]).length + "/8")
