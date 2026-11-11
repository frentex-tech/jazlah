// OPX-DES-1 (customer mobile): orders list, order detail + tracking + freshness, cancel flow with refund choice, complaint (form, status, list),
// notification center, support contact, marketing opt-in. Page 10 Customer App. Components and templates only. Arabic RTL, no notes inside screens.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App"
await page(P).loadAsync()
{ const own = ["sec-opx-orders", "sec-opx-order-detail", "sec-opx-cancel", "sec-opx-complaint", "sec-opx-notifications", "sec-opx-support", "sec-opx-marketing"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- shared helpers (duplicated per OPX script: scripts cannot share top-level code beyond _ds.js) ----
const KD = { error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
async function panel(kind, title, text, cta, ic, col = "ink-2") {
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, col))) : p
}
function mid(b, node) { const t = spacer(), u = spacer(); add(b, t); t.layoutSizingVertical = "FILL"; const w = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 358 }); w.appendChild(node); add(b, w, "h"); add(b, u); u.layoutSizingVertical = "FILL" }
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
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
// standard states from a base screen: o = { load: rows, empty: [title, text, cta, icon], error: [title, text], denied: [title, text, cta, icon] }
async function std(base, o) {
  const out = []
  if (o.load) { const s = stateCopy(base, "Loading"); add(s.body, await skeletonRows(o.load), "h"); out.push(s.screen) }
  if (o.empty) { const s = stateCopy(base, "Empty"); mid(s.body, await panel("orders", ...o.empty)); out.push(s.screen) }
  if (o.error) { const s = stateCopy(base, "Error"); mid(s.body, await panel("error", o.error[0], o.error[1], "إعادة المحاولة")); out.push(s.screen) }
  if (o.denied) { const s = stateCopy(base, "Permission denied"); mid(s.body, await panel("denied", ...o.denied)); out.push(s.screen) }
  return out
}
for (const [w, f, b] of [["card", "ink", "paper"], ["card sub", "ink-2", "paper"], ["title on bg", "ink", "bg"], ["sub on bg", "ink-2", "bg"], ["link", "brand", "paper"], ["danger on tint", "danger", "danger-bg"], ["info on tint", "info", "info-bg"], ["ink on sand", "ink", "sand"], ["sub on sand", "ink-2", "sand"], ["success on tint", "success", "success-bg"], ["warning on tint", "warning", "warning-bg"]]) chk(w, f, b)
const MD = (t) => "⁦" + t + "⁩"

// ---- Orders list ---------------------------------------------------------------------------------
async function orderCard(id, bt, bl, items, price, date, key) {
  const c = card(358, 12), top = frame("top", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(top, await T("طلب #" + id, "Heading/H3")); add(top, await bdg(bt, bl)); add(c, top, "h")
  const mid1 = frame("mid", { dir: "HORIZONTAL", w: 326, gap: 12, cross: "CENTER" }); add(mid1, await photo(key, 56, 56, "thumb", "sm"))
  const tx = frame("text", { gap: 2, w: 258 }); add(tx, await T("مجازر الفلاح", "Label/M", "ink", 258), "h"); add(tx, await T(items, "Body/M", "ink-2", 258), "h"); add(mid1, tx); add(c, mid1, "h")
  const ft = frame("foot", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN" }); add(ft, await T(price, "Label/M")); add(ft, await T(date, "Body/M", "ink-2")); add(c, ft, "h")
  return c
}
const ORD = [["10482", "info", "في الطريق", "ريب آي بقري طازج × 2، ساق خروف × 1", "338.00 ر.س", "اليوم، 4:00 م", "ribeye-paper"], ["10455", "success", "تم التسليم", "خروف نعيمي كامل (ذبيحة)", "1,180.00 ر.س", "7 نوفمبر 2026", "lamb-leg"], ["10431", "danger", "ملغي", "مفروم بقري × 3 كجم", "165.00 ر.س", "2 نوفمبر 2026", "strips"]]
const ol = await mobileScreen({ path: "Orders/List", header: { type: "page", title: "طلباتي" }, tab: "3", gap: 12 })
{ const r = frame("filters", { dir: "HORIZONTAL", gap: 8 }); add(r, await chip("الكل", "selected")); add(r, await chip("الجارية", "default")); add(r, await chip("المكتملة", "default")); add(ol.body, r, "h")
  for (const o of ORD) add(ol.body, await orderCard(...o), "h") }
const olS = await std(ol, { load: 3, empty: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب", "package"], error: ["تعذّر تحميل الطلبات", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["سجّل دخولك لعرض الطلبات", "طلباتك محفوظة في حسابك. سجّل الدخول لمتابعتها.", "تسجيل الدخول", "lock-simple"] })
await screenSection(ctx, P, "sec-opx-orders", "قائمة الطلبات · Orders list", async S => { S.main.push(ol.screen); S.states.push(...olS) })

// ---- Order detail (tracking card, freshness card) + live tracking -------------------------------------------
async function courierRow(w, sub) {
  const r = await irow("truck", "فهد الدوسري", sub, w - 56 - 12); const call = frame("call", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "brand", r: "pill" })
  add(call, await icon("phone", 22, "paper")); const row = frame("courier", { dir: "HORIZONTAL", w, gap: 12, cross: "CENTER" }); add(row, r); add(row, call); return row
}
async function fillDetail(b, pre) {
  const s = card(358, 8); const t = frame("top", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" }); add(t, await T("طلب #10482", "Heading/H3")); add(t, await bdg(pre ? "warning" : "info", pre ? "قيد التجهيز" : "في الطريق")); add(s, t, "h")
  add(s, await T("مجازر الفلاح · توصيل اليوم بين 4:00 و6:00 م إلى حي الملقا، الرياض", "Body/M", "ink-2", 326), "h"); add(b, s, "h")
  const tr = card(358, 12); add(tr, await T("تتبع التوصيل", "Heading/H3"), "h")
  if (pre) add(tr, await irow("clock-countdown", "لم يبدأ التوصيل بعد", "سيُعيَّن مندوب التوصيل ويصلك إشعار فور خروج الطلب."), "h")
  else { add(tr, await courierRow(326, "المندوب · يصل خلال 18 دقيقة"), "h"); const l = frame("link", { dir: "HORIZONTAL", h: 44, gap: 4, cross: "CENTER" }); add(l, await T("عرض الخريطة والتتبع الكامل", "Label/M", "brand")); add(l, await icon("caret-left", 16, "brand")); add(tr, l) }
  add(b, tr, "h")
  const fr = card(358, 12), h = frame("head", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" }); add(h, await T("شهادة الطزاجة", "Heading/H3")); if (!pre) add(h, await bdg("brand", "ذُبح اليوم")); add(fr, h, "h")
  if (pre) add(fr, await irow("camera", "بانتظار الذبح والتجهيز", "ستظهر هنا صور الذبح ووقته فور رفعها من المتجر."), "h")
  else { const g = frame("gallery row", { dir: "HORIZONTAL", gap: 8 }); for (const k of ["carcass", "lamb-leg", "cuts"]) add(g, await photo(k, 100, 76, "thumb")); add(fr, g)
    add(fr, await T("ذُبح اليوم الساعة 11:30 ص وبُرّد فورًا، بإشراف مجازر الفلاح.", "Body/M", "ink-2", 326), "h") }
  add(b, fr, "h"); fillSp(b)
  const a = frame("actions", { dir: "HORIZONTAL", w: 358, gap: 12 }); add(a, await button("إلغاء الطلب", "secondary"), "h"); add(a, await button("الإبلاغ عن مشكلة", "ghost"), "h"); add(b, a, "h")
}
const od = await mobileScreen({ path: "Orders/Detail", header: { type: "page", title: "تفاصيل الطلب" }, gap: 12 }); await fillDetail(od.body, false)
const odPre = stateCopy(od, "Before dispatch"); await fillDetail(odPre.body, true)
const odS = await std(od, { load: 3, error: ["تعذّر تحميل الطلب", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["لا يمكنك عرض هذا الطلب", "هذا الطلب مرتبط بحساب آخر.", "رجوع", "lock-simple"] })
const tk = await mobileScreen({ path: "Orders/Tracking", header: { type: "page", title: "تتبع الطلب" }, gap: 12 })
{ const m = await mapBox(358, 250); const cp = await icon("truck", 28, "brand", "fill"); m.appendChild(cp); cp.layoutPositioning = "ABSOLUTE"; cp.x = 90; cp.y = 150; add(tk.body, m, "h")
  const c = card(358, 12); add(c, await courierRow(326, "مندوب التوصيل · لوحة ح ب د 4821"), "h"); add(c, await button("اتصال بالمندوب", "secondary", "default", "S"), "h"); add(tk.body, c, "h")
  const t = inst("status-timeline", { stage: "4" }); add(tk.body, t, "h") }
const tkS = await std(tk, { load: 3, error: ["تعذّر تحميل التتبع", "لم نتمكن من تحديد موقع المندوب. حاول مرة أخرى."], denied: ["التتبع غير متاح", "يظهر التتبع المباشر عند خروج الطلب للتوصيل.", "رجوع", "map-pin-line"] })
await screenSection(ctx, P, "sec-opx-order-detail", "تفاصيل الطلب والتتبع · Order detail & tracking", async S => { S.main.push(od.screen, tk.screen); S.states.push(odPre.screen, ...odS, ...tkS) })

// ---- Cancel flow: reason -> refund choice -> confirm -> done ---------------------------------------------
const rad = async (label, on) => { const r = inst("radio", { checked: on ? "yes" : "no", state: "default" }); await retext(r, "إضافة تغليف هدية", label); return r }
const cancelBase = async (path, title) => mobileScreen({ path, header: { type: "page", title }, gap: 12 })
async function fillReason(b) {
  add(b, await titleBlock("لماذا تريد إلغاء الطلب؟", "طلب #10482 · 338.00 ر.س"), "h")
  const c = card(358, 16); let i = 0; for (const t of ["غيّرت رأيي", "أريد تعديل العنوان أو موعد التوصيل", "وجدت سعرًا أفضل", "تأخر تجهيز الطلب", "سبب آخر"]) add(c, await rad(t, i++ === 0), "h"); add(b, c, "h")
  fillSp(b); add(b, await button("متابعة", "primary"), "h")
}
async function refundOpt(ic, title, sub, on) {
  const c = frame("refund option", { dir: "HORIZONTAL", w: 358, pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: on ? "ember" : "line", sw: on ? 2 : 1, r: "md" })
  const ring = frame("radio", { dir: "HORIZONTAL", w: 24, h: 24, main: "CENTER", cross: "CENTER", stroke: on ? "ember" : "ink-2", sw: 2, r: "pill", ltr: true }); if (on) add(ring, circle("dot", 12, "ember")); add(c, ring)
  add(c, await irow(ic, title, sub, 270), "h"); return c
}
async function fillRefund(b, mode) {
  if (mode === "error") add(b, await setLabel(inst("toast", { type: "error" }), "تعذّر إلغاء الطلب، حاول مرة أخرى"), "h")
  add(b, await titleBlock("كيف تريد استرداد المبلغ؟", "اختر وجهة المبلغ المسترد، 338.00 ر.س."), "h")
  add(b, await refundOpt("wallet", "إلى محفظة جزلة", "فوري، وتستخدمه في طلبك القادم", true), "h")
  add(b, await refundOpt("credit-card", "إلى بطاقة مدى المنتهية بـ 4821", "من 3 إلى 5 أيام عمل", false), "h")
  const s = card(358, 8); for (const [k, v] of [["المنتجات", "323.00 ر.س"], ["التوصيل", "15.00 ر.س"], ["رسوم الإلغاء", "0.00 ر.س"], ["المبلغ المسترد", "338.00 ر.س"]]) { const r = frame("line", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN" }); const last = k === "المبلغ المسترد"; add(r, await T(k, last ? "Label/M" : "Body/M", last ? "ink" : "ink-2")); add(r, await T(v, last ? "Label/M" : "Body/M")); add(s, r, "h") }
  add(b, s, "h"); fillSp(b)
  add(b, await button("تأكيد الإلغاء", "danger", mode === "loading" ? "loading" : "default"), "h"); add(b, await button("رجوع", "ghost"), "h")
}
const c1 = await cancelBase("Cancel/Reason", "إلغاء الطلب"); await fillReason(c1.body)
const c2 = await cancelBase("Cancel/Refund", "إلغاء الطلب"); await fillRefund(c2.body)
const c3 = stateCopy(c2, "Confirm", true); dim(c3.screen)
{ const d = inst("dialog", { type: "destructive" }); await retext(d, "حذف العنوان؟", "إلغاء الطلب #10482؟"); await retext(d, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "سيُلغى طلبك ويُسترد 338.00 ر.س إلى محفظة جزلة. لا يمكن التراجع عن الإلغاء."); await retext(d, "حذف", "نعم، ألغِ الطلب"); await retext(d, "إلغاء", "تراجع"); overlay(c3.screen, d, 35, 300) }
const c4 = await cancelBase("Cancel/Done", null); c4.screen.findOne(n => n.name === "body").children.forEach(k => k.remove())
{ const col = frame("done", { w: 358, gap: 16, cross: "CENTER" }), ring = frame("ok", { dir: "HORIZONTAL", w: 88, h: 88, main: "CENTER", cross: "CENTER", fill: "success-bg", r: "pill" }); add(ring, await icon("check-circle", 48, "success", "fill")); add(col, ring)
  add(col, await T("تم إلغاء الطلب", "Heading/H1", "ink", 358)); add(col, await T("سيصل 338.00 ر.س إلى محفظة جزلة خلال دقائق، وسنرسل لك تأكيدًا بالإشعار.", "Body/M", "ink-2", 326)); col.children.slice(1).forEach(n => n.textAlignHorizontal = "CENTER")
  mid(c4.body, col); add(c4.body, await button("العودة إلى الطلبات", "primary"), "h") }
const c2L = stateCopy(c2, "Loading"); await fillRefund(c2L.body, "loading")
const c2E = stateCopy(c2, "Error"); await fillRefund(c2E.body, "error")
const c2D = stateCopy(c2, "Permission denied"); mid(c2D.body, await panel("denied", "الإلغاء غير متاح الآن", "بدأ المتجر تجهيز طلبك. تواصل مع الدعم إن احتجت مساعدة.", "تواصل مع الدعم", "prohibit"))
await screenSection(ctx, P, "sec-opx-cancel", "إلغاء الطلب والاسترداد · Cancel & refund", async S => { S.note = "الإلغاء مجاني قبل بدء التجهيز. بعد بدء الذبح يتحوّل الطلب إلى شكوى عبر الدعم."; S.main.push(c1.screen, c2.screen, c3.screen, c4.screen); S.states.push(c2L.screen, c2E.screen, c2D.screen) })

// ---- Complaint: form, status, list ----------------------------------------------------------------------
async function addTile() { const t = frame("add photo", { w: 80, h: 80, main: "CENTER", cross: "CENTER", gap: 4, stroke: "ink-2", r: "md" }); add(t, await icon("camera", 24, "ink-2")); add(t, await T("إضافة", "Body/M", "ink-2")); return t }
async function fillForm(b, o) {
  const oc = card(358, 12, { dir: "HORIZONTAL", cross: "CENTER" }); add(oc, await photo("ribeye-paper", 56, 56, "thumb", "sm")); const tx = frame("t", { gap: 2, w: 250 }); add(tx, await T("طلب #10455 · مجازر الفلاح", "Label/M", "ink", 250), "h"); add(tx, await T("ريب آي بقري طازج × 2 · وصل 7 نوفمبر", "Body/M", "ink-2", 250), "h"); add(oc, tx); add(b, oc, "h")
  const ch = frame("reasons", { dir: "HORIZONTAL", gap: 8, w: 358 }); ch.layoutWrap = "WRAP"; for (const [i, t] of ["جودة المنتج", "نقص في الطلب", "تأخر التوصيل"].entries()) add(ch, await chip(t, o.fill && i === 0 ? "selected" : "default")); add(b, ch, "h")
  add(b, o.err ? await field("وصف المشكلة", "اكتب هنا", "error", "اكتب وصفًا لا يقل عن 10 أحرف") : o.fill ? await field("وصف المشكلة", "الريب آي وصل بلون غامق ورائحة غير طازجة", "filled") : await field("وصف المشكلة", "اكتب هنا", "default"), "h")
  add(b, await T("أرفق صور المنتج (حتى 4 صور)", "Label/M", "ink", 358), "h")
  const ph = frame("photos", { dir: "HORIZONTAL", gap: 8 }); if (o.fill) for (const k of ["ribeye-paper", "steaks-dark"]) add(ph, await photo(k, 80, 80, "thumb")); add(ph, await addTile()); add(b, ph)
  fillSp(b); add(b, await button("إرسال الشكوى", "primary", o.load ? "loading" : o.fill ? "default" : "disabled"), "h")
}
const cf = await mobileScreen({ path: "Complaint/New", header: { type: "page", title: "الإبلاغ عن مشكلة" }, gap: 12 }); await fillForm(cf.body, {})
const cfF = stateCopy(cf, "Filled"); await fillForm(cfF.body, { fill: 1 })
const cfE = stateCopy(cf, "Error"); await fillForm(cfE.body, { err: 1 })
const cfL = stateCopy(cf, "Loading"); await fillForm(cfL.body, { fill: 1, load: 1 })
const cfD = stateCopy(cf, "Permission denied"); mid(cfD.body, await panel("denied", "انتهت مهلة تقديم الشكوى", "يمكن تقديم الشكوى خلال 48 ساعة من التسليم. تواصل مع الدعم لمساعدتك.", "تواصل مع الدعم", "clock-countdown"))
async function fillStatus(b, done) {
  const h = card(358, 8), t = frame("t", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" }); add(t, await T("شكوى #C-2031", "Heading/H3")); add(t, await bdg(done ? "success" : "info", done ? "تم الحل" : "قيد المراجعة")); add(h, t, "h")
  add(h, await T("جودة المنتج · طلب #10455 · قُدّمت اليوم 10:42 ص", "Body/M", "ink-2", 326), "h"); add(b, h, "h")
  const s = card(358, 16); add(s, await irow("check-circle", "تم استلام الشكوى", "10:42 ص", 326, "success"), "h"); add(s, await irow(done ? "check-circle" : "hourglass", "مراجعة فريق الدعم", done ? "11:20 ص" : "نرد خلال 24 ساعة", 326, done ? "success" : "ink"), "h"); add(s, await irow(done ? "wallet" : "circle-dashed", "قرار الاسترداد", done ? "89.00 ر.س إلى محفظتك" : "بعد انتهاء المراجعة", 326, done ? "success" : "ink-2"), "h"); add(b, s, "h")
  const p = card(358, 8); add(p, await T("الصور المرفقة", "Label/M", "ink", 326), "h"); const g = frame("g", { dir: "HORIZONTAL", gap: 8 }); for (const k of ["ribeye-paper", "steaks-dark"]) add(g, await photo(k, 100, 76, "thumb")); add(p, g); add(b, p, "h")
  if (done) { const r = card(358, 4, { fill: "success-bg", stroke: null }); add(r, await T("رد الدعم", "Label/M", "ink", 326), "h"); add(r, await T("نعتذر عن التجربة. أضفنا 89.00 ر.س إلى محفظتك ونراجع الأمر مع المتجر.", "Body/M", "ink-2", 326), "h"); add(b, r, "h") }
}
const cs = await mobileScreen({ path: "Complaint/Status", header: { type: "page", title: "حالة الشكوى" }, gap: 12 }); await fillStatus(cs.body, false)
const csR = stateCopy(cs, "Resolved"); await fillStatus(csR.body, true)
const csS = await std(cs, { load: 3, error: ["تعذّر تحميل الشكوى", "تحقق من اتصالك ثم حاول مرة أخرى."] })
const cl = await mobileScreen({ path: "Complaint/List", header: { type: "page", title: "شكاواي" }, gap: 12 })
for (const [id, bt, bl, tx, d] of [["C-2031", "info", "قيد المراجعة", "جودة المنتج · طلب #10455", "اليوم، 10:42 ص"], ["C-1987", "success", "تم الحل", "نقص في الطلب · طلب #10390", "28 أكتوبر 2026"]]) { const c = card(358, 8), t = frame("t", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" }); add(t, await T("شكوى #" + id, "Heading/H3")); add(t, await bdg(bt, bl)); add(c, t, "h"); add(c, await T(tx, "Body/M", "ink", 326), "h"); add(c, await T(d, "Body/M", "ink-2", 326), "h"); add(cl.body, c, "h") }
const clS = await std(cl, { load: 2, empty: ["لا توجد شكاوى", "إذا واجهت مشكلة في طلب، يمكنك الإبلاغ عنها من تفاصيل الطلب.", "عرض طلباتي", "chat-circle-text"], error: ["تعذّر تحميل الشكاوى", "تحقق من اتصالك ثم حاول مرة أخرى."] })
await screenSection(ctx, P, "sec-opx-complaint", "الشكاوى · Complaints", async S => { S.main.push(cf.screen, cs.screen, cl.screen); S.states.push(cfF.screen, cfE.screen, cfL.screen, cfD.screen, csR.screen, ...csS, ...clS) })

// ---- Notification center ---------------------------------------------------------------------------------
async function note(ic, title, body, time, unread) {
  const c = frame("notification", { dir: "HORIZONTAL", w: 358, pad: 16, gap: 12, fill: unread ? "paper" : "bg", stroke: "line", r: "md" })
  add(c, await irow(ic, title, body, 290), "h"); const col = frame("meta", { gap: 8, cross: "CENTER" }); add(col, await T(time, "Body/M", "ink-2")); if (unread) add(col, circle("unread", 8, "ember")); add(c, col); return c
}
const nc = await mobileScreen({ path: "Notifications/Center", header: { type: "page", title: "الإشعارات" }, gap: 12 })
{ const r = frame("filters", { dir: "HORIZONTAL", w: 358, main: "SPACE_BETWEEN", cross: "CENTER" }), cr = frame("chips", { dir: "HORIZONTAL", gap: 8 }); for (const [t, s] of [["الكل", "selected"], ["الطلبات", "default"], ["العروض", "default"]]) add(cr, await chip(t, s)); add(r, cr); add(r, await T("قراءة الكل", "Label/M", "brand")); add(nc.body, r, "h")
  add(nc.body, await T("اليوم", "Label/M", "ink-2", 358), "h")
  add(nc.body, await note("truck", "مندوبك في الطريق", "فهد في طريقه إليك بطلب #10482، يصل خلال 18 دقيقة.", "12:10 م", true), "h")
  add(nc.body, await note("seal-check", "ذُبح وجُهّز طلبك", "أضاف مجازر الفلاح صور الذبح لطلب #10482.", "11:30 ص", true), "h")
  add(nc.body, await T("أمس", "Label/M", "ink-2", 358), "h")
  add(nc.body, await note("tag", "خصم 15% على الأضاحي", "عرض لمدة محدودة على خراف نعيمي حتى الجمعة.", "أمس", false), "h")
  add(nc.body, await note("wallet", "تم استرداد 89.00 ر.س", "أُضيف المبلغ إلى محفظتك بعد مراجعة شكوى #C-2031.", "أمس", false), "h") }
const ncS = await std(nc, { load: 4, empty: ["لا توجد إشعارات", "ستصلك هنا تحديثات طلباتك وعروضنا.", "تصفّح المتاجر", "bell"], error: ["تعذّر تحميل الإشعارات", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["الإشعارات متوقفة", "فعّل الإشعارات من إعدادات جهازك لتصلك تحديثات طلباتك.", "فتح الإعدادات", "bell-slash"] })
await screenSection(ctx, P, "sec-opx-notifications", "مركز الإشعارات · Notification center", async S => { S.main.push(nc.screen); S.states.push(...ncS) })

// ---- Support contact -------------------------------------------------------------------------------------
const sc = await mobileScreen({ path: "Support/Contact", header: { type: "page", title: "الدعم والمساعدة" }, gap: 12 })
{ add(sc.body, await titleBlock("كيف نساعدك؟", "فريق الدعم متاح يوميًا من 8:00 ص إلى 11:00 م."), "h")
  const c = card(358, 16); for (const [ic, t, s] of [["whatsapp-logo", "واتساب", "نرد خلال دقائق"], ["phone", "اتصال هاتفي", MD("+966 11 555 0142")], ["envelope-simple", "البريد الإلكتروني", MD("support@jazlah.sa")]]) add(c, await irow(ic, t, s, 326), "h"); add(sc.body, c, "h")
  const q = card(358, 4); for (const [ic, t] of [["x-circle", "إلغاء طلب واسترداد المبلغ"], ["chat-circle-text", "الإبلاغ عن مشكلة في طلب"], ["question", "الأسئلة الشائعة"]]) { const r = frame("link row", { dir: "HORIZONTAL", w: 326, h: 44, gap: 12, cross: "CENTER" }); add(r, await icon(ic, 22, "ink")); add(r, await T(t, "Body/M", "ink", 260), "h"); add(r, await icon("caret-left", 18, "ink-2")); add(q, r, "h") }
  add(sc.body, q, "h") }
const scS = await std(sc, { load: 3, error: ["تعذّر تحميل بيانات الدعم", "تحقق من اتصالك ثم حاول مرة أخرى."], denied: ["سجّل دخولك للتواصل مع الدعم", "نحتاج لمعرفة طلباتك لنساعدك بشكل أسرع.", "تسجيل الدخول", "lock-simple"] })
await screenSection(ctx, P, "sec-opx-support", "التواصل مع الدعم · Support contact", async S => { S.main.push(sc.screen); S.states.push(...scS) })

// ---- Marketing opt-in: settings + first-order sheet ------------------------------------------------------
async function sw(label, on, dis) { const s = inst("switch", { checked: on ? "yes" : "no", state: dis ? "disabled" : "default" }); await retext(s, "إضافة تغليف هدية", label); return s }
async function fillPrefs(b, osOff) {
  if (osOff) { const w = card(358, 4, { fill: "warning-bg", stroke: null }); add(w, await T("إشعارات التطبيق متوقفة من إعدادات جهازك", "Label/M", "ink", 326), "h"); add(w, await T("فعّلها لتصلك تحديثات الطلبات والعروض.", "Body/M", "ink-2", 326), "h"); add(b, w, "h") }
  add(b, await titleBlock("تفضيلات التواصل", "اختر كيف تريد أن نصلك بعروض جزلة وأخبارها."), "h")
  const c = card(358, 16); add(c, await sw("إشعارات الطلبات (مطلوبة)", true, true), "h"); for (const [t, on] of [["رسائل SMS للعروض", true], ["واتساب للعروض", false], ["البريد الإلكتروني", false], ["إشعارات التطبيق للعروض", !osOff]]) add(c, await sw(t, on, osOff && t.includes("التطبيق")), "h"); add(b, c, "h")
  add(b, await T("يمكنك تغيير اختيارك في أي وقت. لا نشارك رقمك مع أي جهة أخرى.", "Body/M", "ink-2", 358), "h"); fillSp(b); add(b, await button("حفظ التفضيلات", "primary"), "h")
}
const mp = await mobileScreen({ path: "Settings/Marketing", header: { type: "page", title: "تفضيلات التواصل" }, gap: 12 }); await fillPrefs(mp.body, false)
const mpSheet = stateCopy(mp, "First order sheet", true); dim(mpSheet.screen)
{ const sh = inst("bottom-sheet"); await retext(sh, "اختر الحجم", "هل تودّ استلام عروض جزلة؟"); await retext(sh, "اطلب الآن", "نعم، أرسلوا لي العروض")
  const f = await slot(sh, "content", async s => { s.fills = []; s.layoutMode = "VERTICAL"; s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED"; s.counterAxisAlignItems = "MAX"; s.itemSpacing = 8
    add(s, await T("عروض الأضاحي والولائم وخصومات المتاجر القريبة منك، بحد أقصى رسالتين أسبوعيًا.", "Body/M", "ink-2", 342), "h"); add(s, await sw("واتساب", true), "h"); add(s, await sw("إشعارات التطبيق", true), "h") })
  overlay(mpSheet.screen, f, 0, 844 - f.height) }
const mpL = stateCopy(mp, "Loading"); add(mpL.body, await skeletonRows(4), "h")
const mpE = stateCopy(mp, "Error"); mid(mpE.body, await panel("error", "تعذّر حفظ التفضيلات", "لم يُحفظ اختيارك. حاول مرة أخرى.", "إعادة المحاولة"))
const mpD = stateCopy(mp, "Permission denied"); await fillPrefs(mpD.body, true)
await screenSection(ctx, P, "sec-opx-marketing", "الموافقة على العروض · Marketing opt-in", async S => { S.main.push(mp.screen, mpSheet.screen); S.states.push(mpL.screen, mpE.screen, mpD.screen) })

print("✅ OPX customer mobile done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
