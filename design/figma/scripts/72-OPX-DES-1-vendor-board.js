// OPX-DES-1 (vendor dashboard 1): live orders board (columns, new-order alert, card actions), slaughter time picker, freshness photo upload, A6 order label.
// Page 31 Vendor. Components and templates only. Arabic RTL, no notes inside screens.
await loadDS()
const ctx = { y: 0 }
const P = "31 Vendor"
await page(P).loadAsync()
{ const own = ["sec-opx-vendor-board", "sec-opx-vendor-actions", "sec-opx-vendor-label"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- shared helpers (duplicated per OPX script) ----
const KD = { error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
async function panel(kind, title, text, cta, ic, col = "ink-2") {
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, col))) : p
}
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
const BD = { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }
async function bdg(type, label) { const b = inst("badge", { type, size: "S" }); await retext(b, BD[type], label); return b }
const card = (w = 358, g = 12, o = {}) => frame("card", { w, pad: 16, gap: g, fill: "paper", stroke: "line", r: "md", ...o })
const T = (s, st = "Body/M", c = "ink", w) => txt(s, st, c, w ? { w } : {})
async function photo(key, w, h, name = "photo", r = "md") { const f = frame(name, { w, h, fill: "sand", r, clip: true }); f.setSharedPluginData(NS, "photo", key); try { await setPhoto(f, key) } catch (e) {} return f }
async function mapBox(w, h) { const m = await photo("map", w, h, "map"); const p = await icon("map-pin", 36, "ember", "fill"); m.appendChild(p); p.layoutPositioning = "ABSOLUTE"; p.x = w / 2 - 18; p.y = h / 2 - 36; return m }
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
const VD = (path, title, crumb) => dashScreen({ path, role: "vendor", title, crumb, actions: false })

// ---- Live orders board -------------------------------------------------------------------------------------------------
async function bcard(o, alert) {
  const c = frame("order card", { w: 244, pad: 12, gap: 8, fill: "paper", stroke: alert ? "ember" : "line", sw: alert ? 2 : 1, r: "md" })
  const t = frame("top", { dir: "HORIZONTAL", w: 220, main: "SPACE_BETWEEN", cross: "CENTER" }); add(t, await T("#" + o.id, "Heading/H3")); add(t, await bdg(...o.badge)); add(c, t, "h")
  add(c, await T(o.name, "Label/M", "ink", 220), "h"); add(c, await T(o.items, "Body/M", "ink-2", 220), "h")
  const w = frame("when", { dir: "HORIZONTAL", w: 220, gap: 8, cross: "CENTER" }); add(w, await icon(o.ic, 18, "ink-2")); add(w, await T(o.when, "Body/M", "ink", 190), "h"); add(c, w, "h")
  const f = frame("foot", { dir: "HORIZONTAL", w: 220, main: "SPACE_BETWEEN" }); add(f, await T(o.price, "Label/M")); add(f, await T(o.area, "Body/M", "ink-2")); add(c, f, "h")
  if (alert) { const a = frame("timer", { dir: "HORIZONTAL", w: 220, px: 8, py: 4, gap: 8, cross: "CENTER", fill: "warning-bg", r: "sm" }); add(a, await icon("timer", 18, "warning")); add(a, await T("طلب جديد · قبول خلال 04:30", "Label/M", "ink", 180), "h"); add(c, a, "h") }
  const as = frame("actions", { w: 220, gap: 8 }); for (const [l, v] of o.acts) add(as, await button(l, v, "default", "S"), "h"); add(c, as, "h")
  return c
}
const COLS = [
  ["جديدة", [{ id: "10489", badge: ["warning", "بانتظار القبول"], name: "نورة القحطاني", items: "ريب آي × 2، ستيك تي بون × 1", ic: "truck", when: "توصيل اليوم 4:00 – 6:00 م", price: "338.00 ر.س", area: "الملقا", acts: [["قبول الطلب", "primary"], ["رفض", "ghost"]] }, { id: "10490", badge: ["warning", "بانتظار القبول"], name: "خالد الشمري", items: "خروف نعيمي كامل (ذبيحة)", ic: "truck", when: "توصيل اليوم 6:00 – 8:00 م", price: "1,180.00 ر.س", area: "العليا", acts: [["قبول الطلب", "primary"], ["رفض", "ghost"]] }]],
  ["قيد التجهيز", [{ id: "10485", badge: ["info", "لم يُحدد الذبح"], name: "سعد العتيبي", items: "ساق خروف × 2", ic: "knife", when: "الذبح اليوم، التوصيل 4:00 م", price: "290.00 ر.س", area: "النرجس", acts: [["تحديد وقت الذبح", "secondary"], ["رفع صور الطزاجة", "ghost"]] }, { id: "10484", badge: ["brand", "ذُبح 10:30 ص"], name: "ريم الغامدي", items: "مفروم بقري × 3 كجم", ic: "camera", when: "بانتظار صور الطزاجة", price: "165.00 ر.س", area: "الياسمين", acts: [["رفع صور الطزاجة", "secondary"], ["جاهز للتسليم", "ghost"]] }]],
  ["جاهزة للتسليم", [{ id: "10481", badge: ["success", "جاهز"], name: "عبدالله الحربي", items: "كبدة غنم × 2، لحم مفروم × 1", ic: "user", when: "بانتظار المندوب", price: "96.00 ر.س", area: "الورود", acts: [["طباعة الملصق", "secondary"]] }]],
  ["مع المندوب", [{ id: "10478", badge: ["info", "في الطريق"], name: "منى الزهراني", items: "نصف خروف حري", ic: "truck", when: "فهد الدوسري · 18 دقيقة", price: "640.00 ر.س", area: "الحمراء", acts: [["تتبع التوصيل", "ghost"]] }]],
]
async function fillBoard(b, alert) {
  const top = frame("top", { dir: "HORIZONTAL", w: 1132, main: "SPACE_BETWEEN", cross: "CENTER" }); add(top, await bdg("success", "المتجر مفتوح")); const s = inst("switch", { checked: "yes", state: "default" }); await retext(s, "إضافة تغليف هدية", "استقبال الطلبات الجديدة"); add(top, s); add(b, top, "h")
  if (alert) { const a = frame("alert", { dir: "HORIZONTAL", w: 1132, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "warning-bg", r: "md" }); add(a, await icon("bell-ringing", 24, "warning", "fill")); add(a, await T("وصل طلب جديد #10489 من نورة القحطاني بقيمة 338.00 ر.س. اقبله خلال 04:30 دقيقة.", "Label/M", "ink", 900), "h"); add(a, await button("عرض الطلب", "primary", "default", "S")); add(b, a, "h") }
  const row = frame("columns", { dir: "HORIZONTAL", w: 1132, gap: 20, cross: "MIN" })
  for (const [i, [t, os]] of COLS.entries()) { const c = frame("column", { w: 268, pad: 12, gap: 12, fill: "sand", r: "md" }); const h = frame("head", { dir: "HORIZONTAL", w: 244, main: "SPACE_BETWEEN", cross: "CENTER" }); add(h, await T(t, "Heading/H3")); add(h, await T(String(os.length), "Label/M", "ink-2")); add(c, h, "h")
    for (const [j, o] of os.entries()) add(c, await bcard(o, alert && i === 0 && j === 0), "h"); add(row, c) }
  add(b, row, "h")
}
const bd = await VD("Orders/Board", "الطلبات المباشرة", "الطلبات / لوحة مباشرة"); await fillBoard(bd.body, false)
const bdA = stateCopy(bd, "New order alert"); await fillBoard(bdA.body, true)
const bdS = await std(bd, { load: async b => { const r = frame("columns", { dir: "HORIZONTAL", w: 1132, gap: 20, cross: "MIN" }); for (let i = 0; i < 4; i++) { const c = frame("column", { w: 268, pad: 12, gap: 12, fill: "sand", r: "md" }); for (let k = 0; k < 2; k++) add(c, inst("skeleton-row"), "h"); add(r, c) } add(b, r, "h") }, empty: ["لا توجد طلبات اليوم", "ستظهر الطلبات الجديدة هنا فور وصولها، ويصلك تنبيه صوتي.", "تحديث اللوحة", "package"], error: ["تعذّر تحميل اللوحة", "انقطع الاتصال المباشر. حاول مرة أخرى."], denied: ["المتجر موقوف مؤقتًا", "أوقفت الإدارة استقبال الطلبات لمتجرك. تواصل مع فريق البائعين.", "تواصل مع الإدارة", "storefront"] })
await screenSection(ctx, P, "sec-opx-vendor-board", "لوحة الطلبات المباشرة · Live orders board", async S => { S.main.push(bd.screen); S.states.push(bdA.screen, ...bdS) })

// ---- Slaughter time picker + freshness upload (modals over the board) ----------------------------------------------------------
async function modal(title, sub, w = 520) { const m = frame("modal", { w, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "lg" }); await shade(m); add(m, await T(title, "Heading/H2", "ink", w - 48), "h"); add(m, await T(sub, "Body/M", "ink-2", w - 48), "h"); return m }
function onBoard(name, m) { const s = stateCopy(bd, name, true); dim(s.screen); overlay(s.screen, m, (1440 - m.width) / 2, 220); return s.screen }
const errBox = async (t, w) => { const e = frame("error", { dir: "HORIZONTAL", w, px: 12, py: 12, gap: 8, cross: "CENTER", fill: "danger-bg", r: "sm" }); add(e, await icon("warning-circle", 20, "danger")); add(e, await T(t, "Body/M", "ink", w - 52), "h"); return e }
async function picker(mode) {
  const m = await modal("تحديد وقت الذبح", "طلب #10485 · ساق خروف × 2 · موعد التسليم اليوم 4:00 م")
  add(m, await T("وقت الذبح اليوم", "Label/M", "ink", 472), "h")
  const r = frame("slots", { dir: "HORIZONTAL", gap: 8, w: 472 }); r.layoutWrap = "WRAP"; for (const [t, s] of [["9:30 ص", "disabled"], ["10:30 ص", "selected"], ["11:00 ص", "default"], ["11:30 ص", "default"], ["12:00 م", "default"], ["12:30 م", "default"]]) add(r, await chip(t, s)); add(m, r, "h")
  add(m, await T("سيصل العميل إشعار بموعد الذبح، والأوقات الماضية غير متاحة.", "Body/M", "ink-2", 472), "h")
  if (mode === "error") add(m, await errBox("تعذّر حفظ وقت الذبح. تحقق من الاتصال وحاول مرة أخرى.", 472), "h")
  const a = frame("actions", { dir: "HORIZONTAL", w: 472, gap: 12 }); add(a, await button("تأكيد وقت الذبح", "primary", mode === "loading" ? "loading" : "default"), "h"); add(a, await button("إلغاء", "ghost"), "h"); add(m, a, "h")
  return onBoard("Slaughter time picker" + (mode ? " — " + mode : ""), m)
}
async function upload(mode) {
  const m = await modal("رفع صور الطزاجة", "طلب #10484 · ارفع من 1 إلى 4 صور للذبيحة، وتظهر للعميل في تفاصيل الطلب.", 600)
  if (mode === "empty") { const d = frame("dropzone", { w: 552, h: 160, main: "CENTER", cross: "CENTER", gap: 8, stroke: "ink-2", r: "md" }); add(d, await icon("upload-simple", 32, "ink-2")); add(d, await T("اسحب الصور هنا أو اختر من جهازك", "Label/M", "ink", 400)); add(d, await T("JPG أو PNG، حتى 5 م.ب للصورة", "Body/M", "ink-2", 400)); d.children.forEach(n => n.textAlignHorizontal === undefined || (n.textAlignHorizontal = "CENTER")); add(m, d, "h") }
  else { const g = frame("gallery row", { dir: "HORIZONTAL", gap: 12 }); for (const [i, k] of ["carcass", "cuts", "lamb-leg"].entries()) { const col = frame("file", { w: 172, gap: 4 }); const p = await photo(k, 172, 120, "photo"); add(col, p)
      if (mode === "uploading" && i === 2) { add(col, rect("track", 172, 6, "sand", "pill")); const bar = rect("progress", 100, 6, "brand", "pill"); col.appendChild(bar); bar.layoutPositioning = "ABSOLUTE"; bar.x = 72; bar.y = 124 }
      add(col, await T(mode === "error" && i === 2 ? "الملف أكبر من 5 م.ب" : mode === "uploading" && i === 2 ? "جارٍ الرفع… 60%" : "IMG_" + (2041 + i) + ".jpg", "Body/M", mode === "error" && i === 2 ? "danger" : "ink-2", 172), "h"); add(g, col) }
    add(m, g); if (mode === "error") add(m, await errBox("تعذّر رفع صورة واحدة. صغّر حجمها أو احذفها ثم أعد المحاولة.", 552), "h") }
  const a = frame("actions", { dir: "HORIZONTAL", w: 552, gap: 12 }); add(a, await button(mode === "empty" ? "اختيار الصور" : "رفع الصور ونشرها للعميل", "primary", mode === "uploading" ? "loading" : mode === "empty" ? "default" : "default"), "h"); add(a, await button("إلغاء", "ghost"), "h"); add(m, a, "h")
  return onBoard("Freshness upload — " + mode, m)
}
const pk = await picker(), pkL = await picker("loading"), pkE = await picker("error")
const pkD = stateCopy(bd, "Slaughter time — denied", true); dim(pkD.screen); { const m = await modal("تعذّر تعديل وقت الذبح", "سُلّم الطلب #10485 إلى المندوب ولا يمكن تعديل وقت الذبح بعد التسليم."); add(m, await button("حسنًا", "primary"), "h"); overlay(pkD.screen, m, 460, 300) }
const up = await upload("empty"), upF = await upload("filled"), upL = await upload("uploading"), upE = await upload("error")
await screenSection(ctx, P, "sec-opx-vendor-actions", "وقت الذبح ورفع الطزاجة · Slaughter time & freshness upload", async S => { S.main.push(pk, up); S.states.push(pkL, pkE, pkD.screen, upF, upL, upE) })

// ---- A6 order label ---------------------------------------------------------------------------------------------------------------------
async function label() {
  const l = frame("A6 label", { w: 420, h: 594, pad: 24, gap: 12, fill: "paper", stroke: "ink", sw: 2, r: "sm" })
  const h = frame("head", { dir: "HORIZONTAL", w: 372, main: "SPACE_BETWEEN", cross: "CENTER" }); add(h, await T("جزلة", "Display/L", "brand")); add(h, await T("#10482", "Display/L")); add(l, h, "h"); add(l, rect("rule", 372, 2, "ink"), "h")
  for (const [k, v] of [["المتجر", "مجازر الفلاح"], ["العميل", "نورة القحطاني"], ["الجوال", "⁦+966 55 123 4567⁩"], ["العنوان", "حي الملقا، شارع أنس بن مالك، مبنى 12، الرياض"], ["موعد التوصيل", "الأربعاء 11 نوفمبر 2026 · 4:00 – 6:00 م"]]) { const r = frame("field", { dir: "HORIZONTAL", w: 372, gap: 8 }); add(r, await T(k, "Label/M", "ink-2", 90)); add(r, await T(v, "Body/M", "ink", 274), "h"); add(l, r, "h") }
  add(l, rect("rule", 372, 1, "line"), "h"); add(l, await T("المحتويات", "Label/M", "ink-2", 372), "h"); add(l, await T("ريب آي بقري طازج × 2\nساق خروف × 1", "Body/M", "ink", 372), "h")
  const f = frame("fresh", { dir: "HORIZONTAL", w: 372, px: 12, py: 8, gap: 8, cross: "CENTER", fill: "sand", r: "sm" }); add(f, await icon("seal-check", 22, "ink")); add(f, await T("ذُبح اليوم 11:30 ص · مدفوع مسبقًا", "Label/M", "ink", 320), "h"); add(l, f, "h")
  const sp = spacer(); add(l, sp); sp.layoutSizingVertical = "FILL"
  const ft = frame("codes", { dir: "HORIZONTAL", w: 372, main: "SPACE_BETWEEN", cross: "CENTER" }); const qr = frame("qr", { w: 96, h: 96, main: "CENTER", cross: "CENTER" }); add(qr, await icon("qr-code", 96, "ink")); add(ft, qr); add(ft, await icon("barcode", 120, "ink")); add(l, ft, "h")
  return l
}
async function fillLabel(b, mode) {
  const row = frame("columns", { dir: "HORIZONTAL", w: 1132, gap: 24, cross: "MIN" }); add(row, mode === "loading" ? frame("A6 label", { w: 420, h: 594, fill: "sand", r: "sm" }) : await label())
  const o = frame("options", { w: 688, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "md" }); add(o, await T("خيارات الطباعة", "Heading/H3", "ink", 640), "h")
  add(o, await T("المقاس", "Label/M", "ink", 640), "h"); const c = frame("sizes", { dir: "HORIZONTAL", gap: 8 }); add(c, await chip("A6 · 105 × 148 مم", "selected")); add(c, await chip("A5 · 148 × 210 مم", "default")); add(o, c)
  add(o, await T("عدد النسخ", "Label/M", "ink", 640), "h"); const st = inst("stepper", { state: "min" }); await retext(st, "1", "1"); add(o, st)
  if (mode === "error") add(o, await errBox("تعذّر إنشاء الملصق. حاول مرة أخرى أو نزّله بصيغة PDF.", 640), "h")
  add(o, await button("طباعة الملصق", "primary", mode === "loading" ? "loading" : "default"), "h"); add(o, await button("تنزيل PDF", "secondary"), "h"); add(row, o); add(b, row, "h")
}
const lb = await VD("Orders/Label", "ملصق الطلب #10482", "الطلبات / ملصق الطلب"); await fillLabel(lb.body)
const lbL = stateCopy(lb, "Loading"); await fillLabel(lbL.body, "loading")
const lbE = stateCopy(lb, "Error"); await fillLabel(lbE.body, "error")
const lbS = await std(lb, { empty: ["الملصق غير جاهز", "يُنشأ الملصق بعد قبول الطلب. اقبل الطلب أولًا.", "العودة إلى اللوحة", "tag"], denied: ["لا تملك صلاحية الطباعة", "طباعة الملصقات متاحة لمشرف المتجر وموظف التجهيز فقط.", "رجوع", "printer"] })
await screenSection(ctx, P, "sec-opx-vendor-label", "ملصق الطلب A6 · A6 order label", async S => { S.main.push(lb.screen); S.states.push(lbL.screen, lbE.screen, ...lbS) })

print("✅ OPX vendor board done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
