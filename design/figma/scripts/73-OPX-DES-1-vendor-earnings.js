// OPX-DES-1 (vendor dashboard 2): earnings (summary KPIs, entries) and payouts. Page 31 Vendor. Components and templates only. Arabic RTL, no notes inside screens.
await loadDS()
const ctx = { y: 0 }
const P = "31 Vendor"
await page(P).loadAsync()
{ const own = ["sec-opx-vendor-earnings", "sec-opx-vendor-payouts"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- shared helpers (duplicated per OPX script) ----
const KD = { error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
async function panel(kind, title, text, cta, ic, col = "ink-2") {
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, col))) : p
}
const BD = { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }
async function bdg(type, label) { const b = inst("badge", { type, size: "S" }); await retext(b, BD[type], label); return b }
const card = (w = 358, g = 12, o = {}) => frame("card", { w, pad: 16, gap: g, fill: "paper", stroke: "line", r: "md", ...o })
const T = (s, st = "Body/M", c = "ink", w) => txt(s, st, c, w ? { w } : {})
async function irow(ic, title, sub, w, col = "ink") {
  const r = frame("row", { dir: "HORIZONTAL", w, gap: 12, cross: "CENTER" }), ring = frame("icon", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" })
  add(ring, await icon(ic, 24, col)); add(r, ring)
  const c = frame("text", { gap: 2, w: w - 56 }); add(c, await T(title, "Label/M", "ink", w - 56), "h"); if (sub) add(c, await T(sub, "Body/M", "ink-2", w - 56), "h")
  return add(r, c)
}
for (const [w, f, b] of [["card", "ink", "paper"], ["card sub", "ink-2", "paper"], ["title on bg", "ink", "bg"], ["sub on bg", "ink-2", "bg"], ["link", "brand", "paper"], ["danger on tint", "danger", "danger-bg"], ["ink on sand", "ink", "sand"], ["sub on sand", "ink-2", "sand"], ["success on tint", "success", "sand"], ["warning on tint", "warning", "warning-bg"], ["ink on warning tint", "ink", "warning-bg"], ["ink on danger tint", "ink", "danger-bg"], ["paper on ember", "paper", "ember"]]) chk(w, f, b)
function dmid(b, node, h = 560) { const w = frame("center", { dir: "HORIZONTAL", main: "CENTER", cross: "CENTER", w: 1132, h }); w.appendChild(node); add(b, w, "h") }
async function std(base, o) {
  const out = []
  if (o.load) { const s = stateCopy(base, "Loading"); await o.load(s.body); out.push(s.screen) }
  if (o.empty) { const s = stateCopy(base, "Empty"); dmid(s.body, await panel("orders", ...o.empty)); out.push(s.screen) }
  if (o.error) { const s = stateCopy(base, "Error"); dmid(s.body, await panel("error", o.error[0], o.error[1], "إعادة المحاولة")); out.push(s.screen) }
  if (o.denied) { const s = stateCopy(base, "Permission denied"); dmid(s.body, await panel("denied", ...o.denied)); out.push(s.screen) }
  return out
}
chk("ink on info tint", "ink", "sand"); chk("brand id link", "brand", "paper")
const VD = (path, title, crumb) => dashScreen({ path, role: "vendor", title, crumb, actions: false })
// table: cols [[title, width]] (sum 1068), rows of strings or { b: [badgeType, label] }; mode default | loading
async function table(cols, rows, mode) {
  const c = frame("table", { w: 1132, fill: "paper", stroke: "line", r: "md", clip: true }), hd = frame("header", { dir: "HORIZONTAL", w: 1132, px: 32, h: 48, cross: "CENTER", fill: "sand" })
  for (const [t, w] of cols) { const k = frame("cell", { dir: "HORIZONTAL", w, h: 48, cross: "CENTER" }); add(k, await T(t, "Label/M")); add(hd, k) }
  add(c, hd, "h")
  for (const [ri, R] of rows.entries()) {
    const row = frame("row", { dir: "HORIZONTAL", w: 1132, px: 32, h: 56, cross: "CENTER" }); row.strokes = [paint("line")]; row.strokeTopWeight = 0; row.strokeBottomWeight = 1; row.strokeLeftWeight = 0; row.strokeRightWeight = 0
    for (const [i, [, w]] of cols.entries()) { const k = frame("cell", { dir: "HORIZONTAL", w, h: 56, cross: "CENTER" })
      if (mode === "loading") add(k, rect("sk", 80 + ((ri + i) % 3) * 30, 12, "sand", "pill"))
      else if (R[i].b) add(k, await bdg(...R[i].b)); else add(k, await T(R[i], "Body/M", i === 0 ? "brand" : "ink")); add(row, k) }
    add(c, row, "h")
  }
  return c
}
async function filters(b, ctaLabel) {
  const r = frame("filters", { dir: "HORIZONTAL", w: 1132, main: "SPACE_BETWEEN", cross: "CENTER" }), cr = frame("chips", { dir: "HORIZONTAL", gap: 8 })
  for (const [t, s] of [["هذا الشهر", "selected"], ["آخر 7 أيام", "default"], ["الشهر الماضي", "default"]]) add(cr, await chip(t, s)); add(r, cr); add(r, await button(ctaLabel, "secondary", "default", "S")); add(b, r, "h")
}

// ---- Earnings: summary + entries -----------------------------------------------------------------------------------------------
const ENT = [["#10478", "11 نوفمبر 2026", { b: ["warning", "قيد التسوية"] }, "640.00 ر.س", "-76.80 ر.س", "563.20 ر.س"], ["#10481", "11 نوفمبر 2026", { b: ["warning", "قيد التسوية"] }, "96.00 ر.س", "-11.52 ر.س", "84.48 ر.س"], ["#10470", "10 نوفمبر 2026", { b: ["success", "مكتمل"] }, "1,180.00 ر.س", "-141.60 ر.س", "1,038.40 ر.س"], ["#10466", "10 نوفمبر 2026", { b: ["success", "مكتمل"] }, "245.00 ر.س", "-29.40 ر.س", "215.60 ر.س"], ["#C-2031", "9 نوفمبر 2026", { b: ["danger", "استرداد شكوى"] }, "-89.00 ر.س", "+10.68 ر.س", "-78.32 ر.س"], ["#10459", "9 نوفمبر 2026", { b: ["success", "مكتمل"] }, "410.00 ر.س", "-49.20 ر.س", "360.80 ر.س"]]
const EC = [["رقم الطلب", 140], ["التاريخ", 170], ["النوع", 160], ["المبيعات", 170], ["العمولة (12%)", 170], ["الصافي للمتجر", 258]]
async function fillEarn(b, mode) {
  add(b, await (async () => { const r = frame("kpis", { dir: "HORIZONTAL", w: 1132, main: "SPACE_BETWEEN" })
    for (const [l, v, d, up] of [["الرصيد القابل للسحب", "4,860.00 ر.س", "12% عن الأسبوع الماضي", 1], ["مبيعات نوفمبر", "18,420.00 ر.س", "8% عن الشهر الماضي", 1], ["عمولة جزلة (12%)", "2,210.40 ر.س", "8% عن الشهر الماضي", 1], ["طلبات مكتملة", "142", "3% عن الشهر الماضي", 0]]) {
      const k = inst("kpi-card", { trend: up ? "up" : "down" }); await retext(k, "طلبات اليوم", l); await retext(k, "128", v); await retext(k, up ? "12% عن أمس" : "5% عن أمس", d)
      if (mode === "loading") k.findAll(n => n.type === "TEXT").forEach(t => (t.opacity = 0.2)); add(r, k) } return r })(), "h")
  const nx = frame("next payout", { dir: "HORIZONTAL", w: 1132, px: 16, py: 16, gap: 12, cross: "CENTER", fill: "sand", r: "md" }); add(nx, await icon("bank", 28, "info")); add(nx, await T("الدفعة القادمة الخميس 12 نوفمبر 2026 بقيمة 4,860.00 ر.س إلى الحساب المنتهي بـ 7741.", "Label/M", "ink", 880), "h"); add(nx, await button("عرض الدفعات", "secondary", "default", "S")); add(b, nx, "h")
  await filters(b, "تصدير CSV"); add(b, await table(EC, ENT, mode), "h")
}
const ea = await VD("Earnings/Summary", "الأرباح", "المالية / الأرباح"); await fillEarn(ea.body)
const eaL = stateCopy(ea, "Loading"); await fillEarn(eaL.body, "loading")
const eaS = [["Empty", "orders", "لا توجد حركات في هذه الفترة", "ستظهر مبيعاتك وعمولاتك هنا بعد أول طلب مكتمل.", "عرض الشهر الماضي", "receipt"], ["Error", "error", "تعذّر تحميل الأرباح", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة"], ["Permission denied", "denied", "الأرباح متاحة لمالك المتجر فقط", "اطلب من مالك المتجر منحك صلاحية المالية.", "طلب الصلاحية", "lock-simple"]]
const eaX = []; for (const [st, k, ...a] of eaS) { const s = stateCopy(ea, st); dmid(s.body, await panel(k, ...a)); eaX.push(s.screen) }
await screenSection(ctx, P, "sec-opx-vendor-earnings", "الأرباح · Vendor earnings", async S => { S.main.push(ea.screen); S.states.push(eaL.screen, ...eaX) })

// ---- Payouts -------------------------------------------------------------------------------------------------------------------------------------
const PAY = [["P-0318", "3 – 9 نوفمبر", "12 نوفمبر 2026", "4,860.00 ر.س", { b: ["info", "مجدولة"] }], ["P-0317", "27 أكتوبر – 2 نوفمبر", "5 نوفمبر 2026", "5,120.50 ر.س", { b: ["success", "تم التحويل"] }], ["P-0316", "20 – 26 أكتوبر", "29 أكتوبر 2026", "4,310.00 ر.س", { b: ["success", "تم التحويل"] }], ["P-0315", "13 – 19 أكتوبر", "22 أكتوبر 2026", "3,975.25 ر.س", { b: ["success", "تم التحويل"] }], ["P-0314", "6 – 12 أكتوبر", "15 أكتوبر 2026", "2,480.00 ر.س", { b: ["warning", "أُعيد تحويلها"] }]]
const PC = [["رقم الدفعة", 160], ["الفترة", 300], ["تاريخ التحويل", 200], ["المبلغ", 200], ["الحالة", 208]]
async function fillPay(b, mode) {
  const bk = frame("bank", { dir: "HORIZONTAL", w: 1132, pad: 20, gap: 16, cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(bk, await irow("bank", "مصرف الراجحي · SA•• •••• •••• 7741", "حساب المتجر لاستلام الدفعات، تُحوَّل كل خميس.", 800), "h"); add(bk, await button("تعديل الحساب", "secondary", "default", "S")); add(b, bk, "h")
  await filters(b, "تصدير كشف الحساب"); add(b, await table(PC, PAY, mode), "h")
}
const pa = await VD("Earnings/Payouts", "الدفعات", "المالية / الدفعات"); await fillPay(pa.body)
const paL = stateCopy(pa, "Loading"); await fillPay(paL.body, "loading")
const paX = []; for (const [st, k, ...a] of [["Empty", "orders", "لا توجد دفعات بعد", "تُجدول أول دفعة بعد أول طلب مكتمل في متجرك.", "عرض الأرباح", "bank"], ["Error", "error", "تعذّر تحميل الدفعات", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة"], ["Permission denied", "denied", "الدفعات متاحة لمالك المتجر فقط", "اطلب من مالك المتجر منحك صلاحية المالية.", "طلب الصلاحية", "lock-simple"]]) { const s = stateCopy(pa, st); dmid(s.body, await panel(k, ...a)); paX.push(s.screen) }
await screenSection(ctx, P, "sec-opx-vendor-payouts", "الدفعات · Vendor payouts", async S => { S.main.push(pa.screen); S.states.push(paL.screen, ...paX) })

print("✅ OPX vendor earnings done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
