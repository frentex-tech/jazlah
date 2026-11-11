// OPX-DES-1 (customer web 1440): order detail + tracking + freshness, cancel with refund choice, complaint form + status, notification center, support + marketing opt-in.
// Page 20 Customer Web. Components and templates only. Arabic RTL, no notes inside screens.
await loadDS()
const ctx = { y: 0 }
const P = "20 Customer Web"
await page(P).loadAsync()
{ const own = ["sec-opx-web-order", "sec-opx-web-cancel", "sec-opx-web-complaint", "sec-opx-web-notifications", "sec-opx-web-support"]
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
const BD = { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }
async function bdg(type, label) { const b = inst("badge", { type, size: "S" }); await retext(b, BD[type], label); return b }
const card = (w = 358, g = 12, o = {}) => frame("card", { w, pad: 16, gap: g, fill: "paper", stroke: "line", r: "md", ...o })
const T = (s, st = "Body/M", c = "ink", w) => txt(s, st, c, w ? { w } : {})
async function photo(key, w, h, name = "photo", r = "md") { const f = frame(name, { w, h, fill: "sand", r, clip: true }); f.setSharedPluginData(NS, "photo", key); try { await setPhoto(f, key) } catch (e) {} return f }
async function mapBox(w, h) { const m = await photo("map", w, h, "map"); const p = await icon("map-pin", 36, "ember", "fill"); m.appendChild(p); p.layoutPositioning = "ABSOLUTE"; p.x = w / 2 - 18; p.y = h / 2 - 36; return m }
async function irow(ic, title, sub, w = 326, col = "ink") {
  const r = frame("row", { dir: "HORIZONTAL", w, gap: 12, cross: "CENTER" }), ring = frame("icon", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" })
  add(ring, await icon(ic, 24, col)); add(r, ring)
  const c = frame("text", { gap: 2, w: w - 56 }); add(c, await T(title, "Label/M", "ink", w - 56), "h"); if (sub) add(c, await T(sub, "Body/M", "ink-2", w - 56), "h")
  return add(r, c)
}
async function setLabel(n, s) { const t = n.findOne(x => x.name === "label"); await figma.loadFontAsync(t.fontName); t.characters = s; return n }
for (const [w, f, b] of [["card", "ink", "paper"], ["card sub", "ink-2", "paper"], ["title on bg", "ink", "bg"], ["sub on bg", "ink-2", "bg"], ["link", "brand", "paper"], ["danger on tint", "danger", "danger-bg"], ["info on tint", "info", "info-bg"], ["ink on sand", "ink", "sand"], ["sub on sand", "ink-2", "sand"], ["success on tint", "success", "success-bg"], ["warning on tint", "warning", "warning-bg"]]) chk(w, f, b)
const MD = (t) => "⁦" + t + "⁩"
function wmid(b, node, h = 440) { const w = frame("center", { dir: "HORIZONTAL", main: "CENTER", cross: "CENTER", w: 1200, h }); w.appendChild(node); add(b, w, "h") }
async function std(base, o) {
  const out = []
  if (o.load) { const s = stateCopy(base, "Loading"); const f = frame("loading", { gap: 12, w: 1200 }); for (let i = 0; i < o.load; i++) add(f, inst("skeleton-row"), "h"); add(s.body, f, "h"); out.push(s.screen) }
  if (o.empty) { const s = stateCopy(base, "Empty"); wmid(s.body, await panel("orders", ...o.empty)); out.push(s.screen) }
  if (o.error) { const s = stateCopy(base, "Error"); wmid(s.body, await panel("error", o.error[0], o.error[1], "إعادة المحاولة")); out.push(s.screen) }
  if (o.denied) { const s = stateCopy(base, "Permission denied"); wmid(s.body, await panel("denied", ...o.denied)); out.push(s.screen) }
  return out
}
const W = async (path, title) => { const w = await webScreen({ path, active: 3 }); add(w.body, await T(title, "Display/L", "ink", 1200), "h"); return w }
function cols(b, a = 740, c = 436) { const row = frame("columns", { dir: "HORIZONTAL", w: 1200, gap: 24, cross: "MIN" }), r = frame("main", { w: a, gap: 16 }), l = frame("side", { w: c, gap: 16 }); add(row, r); add(row, l); add(b, row, "h"); return [r, l] }
const head = async (title, node, w) => { const r = frame("head", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" }); add(r, await T(title, "Heading/H3")); if (node) add(r, node); return r }
const sumLines = async (c, w, rows) => { for (const [k, v] of rows) { const r = frame("line", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN" }); const last = k === rows[rows.length - 1][0] && rows.last; add(r, await T(k, "Body/M", "ink-2")); add(r, await T(v, "Body/M")); add(c, r, "h") } }

// ---- Order detail + tracking + freshness -------------------------------------------------------------------------
async function fillOrder(b) {
  const [R, L] = cols(b)
  const tr = card(740, 16); add(tr, await head("تتبع التوصيل", await bdg("info", "في الطريق"), 708), "h")
  const m = await mapBox(708, 240); const cp = await icon("truck", 32, "brand", "fill"); m.appendChild(cp); cp.layoutPositioning = "ABSOLUTE"; cp.x = 220; cp.y = 150; add(tr, m, "h")
  const cr = frame("courier", { dir: "HORIZONTAL", w: 708, gap: 12, cross: "CENTER" }); add(cr, await irow("truck", "فهد الدوسري", "مندوب التوصيل · لوحة ح ب د 4821 · يصل خلال 18 دقيقة", 520), "h")
  add(cr, await button("اتصال بالمندوب", "secondary", "default", "S")); add(cr, await button("تتبع الطلب", "primary", "default", "S")); add(tr, cr, "h"); add(R, tr, "h")
  const fr = card(740, 16); add(fr, await head("شهادة الطزاجة", await bdg("brand", "ذُبح اليوم"), 708), "h")
  const g = frame("gallery row", { dir: "HORIZONTAL", gap: 12 }); for (const k of ["carcass", "lamb-leg", "cuts"]) add(g, await photo(k, 228, 150, "gallery")); add(fr, g)
  add(fr, await T("ذُبح اليوم الساعة 11:30 ص وبُرّد فورًا، بإشراف مجازر الفلاح.", "Body/M", "ink-2", 708), "h"); add(R, fr, "h")
  add(L, inst("status-timeline", { stage: "4" }), "h")
  const s = card(436, 8); add(s, await head("طلب #10482", null, 404), "h"); add(s, await T("مجازر الفلاح · الأربعاء 11 نوفمبر 2026", "Body/M", "ink-2", 404), "h")
  await sumLines(s, 404, [["ريب آي بقري طازج × 2", "178.00 ر.س"], ["ساق خروف × 1", "145.00 ر.س"], ["التوصيل", "15.00 ر.س"], ["الإجمالي شامل الضريبة", "338.00 ر.س"]]); add(L, s, "h")
  add(L, await button("إلغاء الطلب", "secondary"), "h"); add(L, await button("الإبلاغ عن مشكلة", "ghost"), "h")
}
const o1 = await W("Orders/Detail", "تفاصيل الطلب"); await fillOrder(o1.body)
const o1S = await std(o1, { load: 3, error: ["تعذّر تحميل الطلب", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["لا يمكنك عرض هذا الطلب", "هذا الطلب مرتبط بحساب آخر.", "رجوع", "lock-simple"] })
await screenSection(ctx, P, "sec-opx-web-order", "تفاصيل الطلب والتتبع · Web order detail", async S => { S.main.push(o1.screen); S.states.push(...o1S) })

// ---- Cancel with refund choice -------------------------------------------------------------------------------------
const rad = async (label, on) => { const r = inst("radio", { checked: on ? "yes" : "no", state: "default" }); await retext(r, "إضافة تغليف هدية", label); return r }
async function refundOpt(ic, title, sub, on) {
  const c = frame("refund option", { dir: "HORIZONTAL", w: 708, pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: on ? "ember" : "line", sw: on ? 2 : 1, r: "md" })
  const ring = frame("radio", { dir: "HORIZONTAL", w: 24, h: 24, main: "CENTER", cross: "CENTER", stroke: on ? "ember" : "ink-2", sw: 2, r: "pill", ltr: true }); if (on) add(ring, circle("dot", 12, "ember")); add(c, ring)
  add(c, await irow(ic, title, sub, 640), "h"); return c
}
async function fillCancel(b, mode) {
  const [R, L] = cols(b)
  if (mode === "error") { const e = card(740, 4, { fill: "danger-bg", stroke: null }); add(e, await T("تعذّر إلغاء الطلب", "Label/M", "danger", 708), "h"); add(e, await T("حدث خطأ أثناء الإلغاء ولم يُسترد أي مبلغ. حاول مرة أخرى.", "Body/M", "ink-2", 708), "h"); add(R, e, "h") }
  const rc = card(740, 16); add(rc, await T("سبب الإلغاء", "Heading/H3", "ink", 708), "h"); let i = 0; for (const t of ["غيّرت رأيي", "أريد تعديل العنوان أو موعد التوصيل", "وجدت سعرًا أفضل", "تأخر تجهيز الطلب"]) add(rc, await rad(t, i++ === 0), "h"); add(R, rc, "h")
  const fc = card(740, 12); add(fc, await T("وجهة المبلغ المسترد", "Heading/H3", "ink", 708), "h")
  add(fc, await refundOpt("wallet", "إلى محفظة جزلة", "فوري، وتستخدمه في طلبك القادم", true), "h"); add(fc, await refundOpt("credit-card", "إلى بطاقة مدى المنتهية بـ 4821", "من 3 إلى 5 أيام عمل", false), "h"); add(R, fc, "h")
  const s = card(436, 12); add(s, await head("طلب #10482", await bdg("info", "قيد التجهيز"), 404), "h")
  await sumLines(s, 404, [["المنتجات", "323.00 ر.س"], ["التوصيل", "15.00 ر.س"], ["رسوم الإلغاء", "0.00 ر.س"], ["المبلغ المسترد", "338.00 ر.س"]])
  add(s, await button("تأكيد الإلغاء", "danger", mode === "loading" ? "loading" : "default"), "h"); add(s, await button("رجوع", "ghost"), "h"); add(L, s, "h")
}
const ca = await W("Cancel/Refund", "إلغاء الطلب واسترداد المبلغ"); await fillCancel(ca.body)
const caL = stateCopy(ca, "Loading"); add(caL.body, await T("إلغاء الطلب واسترداد المبلغ", "Display/L", "ink", 1200), "h"); await fillCancel(caL.body, "loading")
const caE = stateCopy(ca, "Error"); add(caE.body, await T("إلغاء الطلب واسترداد المبلغ", "Display/L", "ink", 1200), "h"); await fillCancel(caE.body, "error")
const caD = stateCopy(ca, "Permission denied"); wmid(caD.body, await panel("denied", "الإلغاء غير متاح الآن", "بدأ المتجر تجهيز طلبك. تواصل مع الدعم إن احتجت مساعدة.", "تواصل مع الدعم", "prohibit"))
await screenSection(ctx, P, "sec-opx-web-cancel", "إلغاء الطلب · Web cancel & refund", async S => { S.main.push(ca.screen); S.states.push(caL.screen, caE.screen, caD.screen) })

// ---- Complaint form + status ------------------------------------------------------------------------------------------
async function fillComplaint(b, o) {
  const [R, L] = cols(b)
  const f = card(740, 16); add(f, await T("الإبلاغ عن مشكلة في طلب #10455", "Heading/H3", "ink", 708), "h")
  const ch = frame("reasons", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["جودة المنتج", "نقص في الطلب", "تأخر التوصيل", "تلف أثناء التوصيل"].entries()) add(ch, await chip(t, o.fill && i === 0 ? "selected" : "default")); add(f, ch)
  add(f, o.err ? await field("وصف المشكلة", "اكتب هنا", "error", "اكتب وصفًا لا يقل عن 10 أحرف") : o.fill ? await field("وصف المشكلة", "الريب آي وصل بلون غامق ورائحة غير طازجة", "filled") : await field("وصف المشكلة", "اكتب هنا", "default"), "h")
  add(f, await T("أرفق صور المنتج (حتى 4 صور)", "Label/M", "ink", 708), "h")
  const ph = frame("photos", { dir: "HORIZONTAL", gap: 12 }); if (o.fill) for (const k of ["ribeye-paper", "steaks-dark"]) add(ph, await photo(k, 120, 120, "thumb"))
  const t = frame("add photo", { w: 120, h: 120, main: "CENTER", cross: "CENTER", gap: 4, stroke: "ink-2", r: "md" }); add(t, await icon("camera", 28, "ink-2")); add(t, await T("إضافة صورة", "Body/M", "ink-2")); add(ph, t); add(f, ph)
  add(f, await button("إرسال الشكوى", "primary", o.load ? "loading" : o.fill ? "default" : "disabled"), "h"); add(R, f, "h")
  const s = card(436, 16); add(s, await head("شكوى #C-2031", await bdg(o.fill ? "info" : "neutral", o.fill ? "قيد المراجعة" : "لم تُرسل بعد"), 404), "h")
  add(s, await irow("check-circle", "تم استلام الشكوى", o.fill ? "10:42 ص" : "بعد الإرسال", 404, o.fill ? "success" : "ink-2"), "h"); add(s, await irow("hourglass", "مراجعة فريق الدعم", "نرد خلال 24 ساعة", 404, "ink-2"), "h"); add(s, await irow("wallet", "قرار الاسترداد", "بعد انتهاء المراجعة", 404, "ink-2"), "h"); add(L, s, "h")
}
const cp = await W("Complaint/New", "الإبلاغ عن مشكلة"); await fillComplaint(cp.body, {})
const cpF = stateCopy(cp, "Filled"); add(cpF.body, await T("الإبلاغ عن مشكلة", "Display/L", "ink", 1200), "h"); await fillComplaint(cpF.body, { fill: 1 })
const cpE = stateCopy(cp, "Error"); add(cpE.body, await T("الإبلاغ عن مشكلة", "Display/L", "ink", 1200), "h"); await fillComplaint(cpE.body, { err: 1 })
const cpL = stateCopy(cp, "Loading"); add(cpL.body, await T("الإبلاغ عن مشكلة", "Display/L", "ink", 1200), "h"); await fillComplaint(cpL.body, { fill: 1, load: 1 })
const cpD = stateCopy(cp, "Permission denied"); wmid(cpD.body, await panel("denied", "انتهت مهلة تقديم الشكوى", "يمكن تقديم الشكوى خلال 48 ساعة من التسليم. تواصل مع الدعم لمساعدتك.", "تواصل مع الدعم", "clock-countdown"))
const cpEm = stateCopy(cp, "Empty"); wmid(cpEm.body, await panel("orders", "لا توجد شكاوى", "إذا واجهت مشكلة في طلب، يمكنك الإبلاغ عنها من تفاصيل الطلب.", "عرض طلباتي", "chat-circle-text"))
await screenSection(ctx, P, "sec-opx-web-complaint", "الشكاوى · Web complaints", async S => { S.main.push(cp.screen); S.states.push(cpF.screen, cpE.screen, cpL.screen, cpD.screen, cpEm.screen) })

// ---- Notification center ------------------------------------------------------------------------------------------------
async function note(ic, title, body, time, unread) {
  const c = frame("notification", { dir: "HORIZONTAL", w: 800, pad: 16, gap: 12, fill: unread ? "paper" : "bg", stroke: "line", r: "md" })
  add(c, await irow(ic, title, body, 700), "h"); const col = frame("meta", { gap: 8, cross: "CENTER" }); add(col, await T(time, "Body/M", "ink-2")); if (unread) add(col, circle("unread", 8, "ember")); add(c, col); return c
}
const nc = await W("Notifications/Center", "الإشعارات")
{ const col = frame("list", { w: 800, gap: 12 }), r = frame("filters", { dir: "HORIZONTAL", w: 800, main: "SPACE_BETWEEN", cross: "CENTER" }), cr = frame("chips", { dir: "HORIZONTAL", gap: 8 }); for (const [t, s] of [["الكل", "selected"], ["الطلبات", "default"], ["العروض", "default"]]) add(cr, await chip(t, s)); add(r, cr); add(r, await T("قراءة الكل", "Label/M", "brand")); add(col, r, "h")
  add(col, await T("اليوم", "Label/M", "ink-2", 800), "h")
  add(col, await note("truck", "مندوبك في الطريق", "فهد في طريقه إليك بطلب #10482، يصل خلال 18 دقيقة.", "12:10 م", true), "h"); add(col, await note("seal-check", "ذُبح وجُهّز طلبك", "أضاف مجازر الفلاح صور الذبح لطلب #10482.", "11:30 ص", true), "h")
  add(col, await T("أمس", "Label/M", "ink-2", 800), "h")
  add(col, await note("tag", "خصم 15% على الأضاحي", "عرض لمدة محدودة على خراف نعيمي حتى الجمعة.", "أمس", false), "h"); add(col, await note("wallet", "تم استرداد 89.00 ر.س", "أُضيف المبلغ إلى محفظتك بعد مراجعة شكوى #C-2031.", "أمس", false), "h"); add(nc.body, col) }
const ncS = await std(nc, { load: 4, empty: ["لا توجد إشعارات", "ستصلك هنا تحديثات طلباتك وعروضنا.", "تصفّح المتاجر", "bell"], error: ["تعذّر تحميل الإشعارات", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["الإشعارات متوقفة", "فعّل الإشعارات من إعدادات المتصفح لتصلك تحديثات طلباتك.", "كيف أفعّلها؟", "bell-slash"] })
await screenSection(ctx, P, "sec-opx-web-notifications", "مركز الإشعارات · Web notifications", async S => { S.main.push(nc.screen); S.states.push(...ncS) })

// ---- Support contact + marketing opt-in ---------------------------------------------------------------------------------
async function sw(label, on, dis) { const s = inst("switch", { checked: on ? "yes" : "no", state: dis ? "disabled" : "default" }); await retext(s, "إضافة تغليف هدية", label); return s }
async function fillSupport(b, osOff) {
  const [R, L] = cols(b, 580, 596)
  const c = card(580, 16); add(c, await T("تواصل معنا", "Heading/H3", "ink", 548), "h"); add(c, await T("فريق الدعم متاح يوميًا من 8:00 ص إلى 11:00 م.", "Body/M", "ink-2", 548), "h")
  for (const [ic, t, s] of [["whatsapp-logo", "واتساب", "نرد خلال دقائق"], ["phone", "اتصال هاتفي", "⁦+966 11 555 0142⁩"], ["envelope-simple", "البريد الإلكتروني", "⁦support@jazlah.sa⁩"]]) add(c, await irow(ic, t, s, 548), "h")
  add(R, c, "h")
  const p = card(596, 16); if (osOff) { const w = card(564, 4, { fill: "warning-bg", stroke: null }); add(w, await T("إشعارات المتصفح متوقفة، فعّلها من إعدادات الموقع ليصلك كل جديد.", "Body/M", "ink", 532), "h"); add(p, w, "h") }
  add(p, await T("تفضيلات التواصل", "Heading/H3", "ink", 564), "h"); add(p, await sw("إشعارات الطلبات (مطلوبة)", true, true), "h")
  for (const [t, on] of [["رسائل SMS للعروض", true], ["واتساب للعروض", false], ["البريد الإلكتروني", false]]) add(p, await sw(t, on), "h")
  add(p, await T("يمكنك تغيير اختيارك في أي وقت. لا نشارك رقمك مع أي جهة أخرى.", "Body/M", "ink-2", 564), "h"); add(p, await button("حفظ التفضيلات", "primary"), "h"); add(L, p, "h")
}
const sp = await W("Support/Contact", "الدعم والتفضيلات"); await fillSupport(sp.body, false)
const spD = stateCopy(sp, "Permission denied"); add(spD.body, await T("الدعم والتفضيلات", "Display/L", "ink", 1200), "h"); await fillSupport(spD.body, true)
const spS = await std(sp, { load: 3, error: ["تعذّر تحميل بيانات الدعم", "تحقق من اتصالك ثم حاول مرة أخرى."], empty: ["لا توجد محادثات دعم", "عندما تتواصل معنا ستظهر محادثاتك هنا.", "تواصل معنا", "chat-circle-text"] })
await screenSection(ctx, P, "sec-opx-web-support", "الدعم والموافقة على العروض · Web support & opt-in", async S => { S.main.push(sp.screen); S.states.push(spD.screen, ...spS) })

print("✅ OPX customer web done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
