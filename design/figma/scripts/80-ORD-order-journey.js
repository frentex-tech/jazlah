// ORD-DES-1: finish the customer order journey (Home > Product > Cart > Checkout 1 > Payment & review > Order placed), mobile + web.
// Pages 10 Customer App and 20 Customer Web. Arabic RTL, components/templates only. Prototype links not wired. Re-run rebuilds its six sections in place.
await loadDS()
const PM = "10 Customer App", PW = "20 Customer Web"
const startY = async (pg, own) => {
  await page(pg).loadAsync()
  const rest = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0
}
const ctx = { y: 0 }, wctx = { y: 0 }
ctx.y = await startY(PM, ["sec-ord-cart-m", "sec-ord-payment-m", "sec-ord-placed-m"])
wctx.y = await startY(PW, ["sec-ord-cart-w", "sec-ord-payment-w", "sec-ord-placed-w"])

// ---- shared helpers --------------------------------------------------------------------------------------
const sar = h => (h / 100).toFixed(2) + " ر.س"
const T = (s, st = "Body/M", c = "ink", w, align) => txt(s, st, c, { ...(w ? { w } : {}), ...(align ? { align } : {}) })
const card = (w, g = 12, o = {}) => frame("card", { w, pad: 16, gap: g, fill: "paper", stroke: "line", r: "md", ...o })
const ar = (s, name) => { s.setSharedPluginData(NS, "ar", name); return s }
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function mid(b, node, w = 358) { const t = spacer(), u = spacer(); add(b, t); t.layoutSizingVertical = "FILL"; const c = frame("center", { dir: "HORIZONTAL", main: "CENTER", w }); c.appendChild(node); add(b, c, "h"); add(b, u); u.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
async function photo(key, w, h, r = "md") { const f = frame("photo", { w, h, fill: "sand", r, clip: true }); f.setSharedPluginData(NS, "photo", key); try { await setPhoto(f, key) } catch (e) {} return f }
async function irow(ic, title, sub, w, col = "ink") {
  const r = frame("row", { dir: "HORIZONTAL", w, gap: 12, cross: "CENTER" }), ring = frame("icon", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" })
  add(ring, await icon(ic, 24, col)); add(r, ring)
  const c = frame("text", { gap: 2, w: w - 56 }); add(c, await T(title, "Label/M", "ink", w - 56), "h"); if (sub) add(c, await T(sub, "Body/M", "ink-2", w - 56), "h")
  return add(r, c)
}
async function panel(kind, title, text, cta) {
  const p = inst("state-panel", { kind }), d = { cart: ["سلتك فارغة", "أضف منتجات من المتاجر وسنجهّزها لك طازجة.", "تصفّح المنتجات"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"] }[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return p
}
async function toast(type, msg) { const t = inst("toast", { type }); const l = t.findOne(x => x.name === "label"); await figma.loadFontAsync(l.fontName); l.characters = msg; return t }
async function qty(n) { const s = inst("stepper", { state: n === 1 ? "min" : "default" }); if (n > 2) await retext(s, "2", n); return s }
for (const [w, f, b, m] of [["card", "ink", "paper"], ["card sub", "ink-2", "paper"], ["title on bg", "ink", "bg"], ["sub on bg", "ink-2", "bg"], ["danger on paper", "danger", "paper"], ["warning on tint", "warning", "warning-bg"], ["ink on tint", "ink", "warning-bg"], ["sub on tint", "ink-2", "warning-bg"], ["success on sand", "success", "sand", 3], ["ink on sand", "ink", "sand"], ["sub on sand", "ink-2", "sand"], ["icon on sand", "brand", "sand", 3], ["ember on paper", "ember", "paper", 3], ["step label", "ink-2", "bg"]]) chk(w, f, b, m)

const LINES = [{ key: "ribeye-paper", name: "ريب آي بقري طازج", opt: "شرائح سميكة · 500 جم للقطعة", qty: 2, unit: 8150 }, { key: "lamb-leg", name: "ساق خروف", opt: "قطع متوسطة · نحو 1.5 كجم", qty: 1, unit: 16000 }]
const FEE = 1500
async function lineRow(w, L, pw, web) {
  const r = frame("cart line", { dir: "HORIZONTAL", w, gap: web ? 24 : 12, cross: "CENTER" })
  add(r, await photo(L.key, pw, pw))
  const cw = web ? w - pw - 24 - 152 - 24 - 110 - 24 : w - pw - 12
  const col = frame("copy", { gap: 4, w: cw })
  add(col, await T(L.name, web ? "Heading/H3" : "Label/M", "ink", cw), "h"); add(col, await T(L.opt, "Body/M", "ink-2", cw), "h")
  if (web) { add(r, col); add(r, await qty(L.qty)); add(r, await T(sar(L.qty * L.unit), "Heading/H3", "ink", 110, "LEFT")); return r }
  const bot = frame("qty row", { dir: "HORIZONTAL", w: cw, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(bot, await qty(L.qty)); add(bot, await T(sar(L.qty * L.unit), "Label/M", "ink", null, "LEFT")); add(col, bot, "h")
  add(r, col); return r
}
async function linesCard(w, lines, pw, web, pad = 16) {
  const c = card(w, 16, { pad }), iw = w - 2 * pad
  for (const [i, L] of lines.entries()) { if (i) add(c, rect("divider", iw, 1, "line"), "h"); add(c, await lineRow(iw, L, pw, web), "h") }
  return c
}
async function promoCard(w, pad = 16) {
  const c = card(w, 8, { pad }), iw = w - 2 * pad
  const r = frame("promo row", { dir: "HORIZONTAL", w: iw, gap: 8, cross: "MAX" })
  add(r, await field("رمز الخصم · اختياري", "أدخل رمز الخصم", "default"), "h"); add(r, await button("تطبيق", "secondary", "default", "S"))
  return add(c, r, "h")
}
async function mrow(w, l, v, st = "Body/M", fg = "ink-2") {
  const r = frame("row", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(r, await T(l, st, fg, w - 110)); add(r, await T(v, st, fg, 100, "LEFT")); return r
}
// price breakdown; prices include 15% VAT. o: sub, noSub (hide subtotal row)
async function totals(w, sub, g = 8) {
  const total = sub + FEE, vat = Math.round(total * 15 / 115), f = frame("totals", { w, gap: g })
  if (sub != null) { add(f, await mrow(w, "المجموع الفرعي", sar(sub)), "h"); add(f, await mrow(w, "رسوم التوصيل", sar(FEE)), "h"); add(f, await mrow(w, "منها ضريبة القيمة المضافة 15%", sar(vat)), "h") }
  add(f, await mrow(w, "الإجمالي", sar(total), "Heading/H3", "ink"), "h")
  return f
}
const skels = (w, hs) => hs.map(h => rect("skeleton", w, h, "sand", "md"))
async function noticeCard(w) {
  const c = frame("min order notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, fill: "warning-bg", r: "md" })
  add(c, await icon("warning", 24, "warning"))
  const col = frame("copy", { gap: 4, w: w - 32 - 36 })
  add(col, await T("الحد الأدنى للطلب 100.00 ر.س", "Label/M", "warning", col.width), "h"); add(col, await T("أضف 18.50 ر.س من المنتجات لإكمال طلبك.", "Body/M", "ink-2", col.width), "h")
  return add(c, col)
}
const DIS_LINES = [{ ...LINES[0], qty: 1 }]
const SUB = 32300, SUB_DIS = 8150

// ---- payment helpers -------------------------------------------------------------------------------------
const METHODS = [["بطاقة مدى · تنتهي بـ 4821", 0], ["Apple Pay", 1], ["محفظة جزلة · الرصيد غير كافٍ", 2, true], ["الدفع عند الاستلام", 3]]
async function methodsCard(w, sel, err, pad = 16, g = 8, hd = "Heading/H3") {
  const c = card(w, g, { pad })
  add(c, await T("طريقة الدفع", hd, "ink", w - 2 * pad), "h")
  for (const [label, i, dis] of METHODS) { const r = inst("radio", { checked: sel === i ? "yes" : "no", state: dis ? "disabled" : "default" }); await retext(r, "إضافة تغليف هدية", label); add(c, r) }
  if (err) { const m = frame("validation", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" }); add(m, await icon("warning-circle", 20, "danger")); add(m, await T("اختر طريقة دفع للمتابعة", "Label/M", "danger")); add(c, m) }
  return c
}
const TERMS = "بتأكيد الطلب فأنت توافق على الشروط والأحكام وسياسة الإلغاء."
async function stepRow(w, n, label) {
  const f = frame("step indicator", { w, gap: 6 })
  add(f, await T(`الخطوة ${n} من 3: ${label}`, "Label/M", "ink-2", w), "h")
  const bars = frame("bars", { dir: "HORIZONTAL", gap: 8 }), bw = Math.floor((w - 16) / 3)
  for (let i = 0; i < 3; i++) add(bars, rect("step " + (i + 1), bw, 4, i < n ? "ember" : "line", "pill"))
  return add(f, bars)
}
const PAY = { Default: [null, false, "تأكيد الطلب", "default", "الدفع والمراجعة"], Filled: [0, false, "تأكيد الطلب", "default", "الدفع والمراجعة · مختارة"], Processing: [0, false, "تأكيد الطلب", "loading", "الدفع والمراجعة · جارٍ المعالجة"], Failed: [0, false, "إعادة المحاولة", "default", "الدفع والمراجعة · فشل الدفع"], Disabled: [null, true, "تأكيد الطلب", "disabled", "الدفع والمراجعة · معطّلة"] }
const DECLINED = "تم رفض الدفع من البنك، جرّب بطاقة أخرى أو وسيلة دفع مختلفة"

// ================================ Mobile ================================
async function fillCartM(b, view) {
  const W = 358
  if (view === "loading") { add(b, await skeletonRows(3), "h"); for (const s of skels(W, [150])) add(b, s, "h"); fillSp(b); add(b, await button("متابعة إلى الدفع", "primary", "disabled"), "h"); return }
  const dis = view === "disabled"
  add(b, await linesCard(W, dis ? DIS_LINES : LINES, 72, false, 12), "h")
  if (dis) add(b, await noticeCard(W), "h")
  add(b, await promoCard(W, 12), "h")
  const t = card(W, 8, { pad: 12 }); add(t, await totals(W - 24, dis ? SUB_DIS : SUB, 6), "h"); add(b, t, "h")
  fillSp(b); add(b, await button("متابعة إلى الدفع", "primary", dis ? "disabled" : "default"), "h")
}
const cm = await mobileScreen({ path: "Cart/Cart", header: { type: "page", title: "السلة" }, gap: 12 }); await fillCartM(cm.body, "normal"); ar(cm.screen, "السلة")
const cmE = stateCopy(cm, "Empty"); mid(cmE.body, await panel("cart", "سلتك فارغة", "أضف منتجات من المتاجر وسنجهّزها لك طازجة.", "تصفّح المنتجات")); ar(cmE.screen, "السلة · فارغة")
const cmL = stateCopy(cm, "Loading"); await fillCartM(cmL.body, "loading"); ar(cmL.screen, "السلة · تحميل")
const cmX = stateCopy(cm, "Error"); mid(cmX.body, await panel("error", "تعذّر تحميل السلة", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة")); ar(cmX.screen, "السلة · خطأ")
const cmD = stateCopy(cm, "Disabled"); await fillCartM(cmD.body, "disabled"); ar(cmD.screen, "السلة · معطّلة")
await screenSection(ctx, PM, "sec-ord-cart-m", "السلة · Cart", async S => { S.main.push(cm.screen); S.states.push(cmE.screen, cmL.screen, cmX.screen, cmD.screen) })

async function fillPayM(b, st) {
  const [sel, err, label, bs] = PAY[st], W = 358
  add(b, await stepRow(W, 2, "الدفع والمراجعة"), "h")
  const a = card(W, 12, { pad: 12 })
  add(a, await irow("shopping-bag", "منتجان من مجازر الفلاح", "ريب آي بقري × 2، ساق خروف × 1", 334), "h")
  add(a, await irow("truck", "الأربعاء 11 نوفمبر · 4:00 – 6:00 م", "توصيل إلى حي الملقا، الرياض", 334), "h"); add(b, a, "h")
  const t = card(W, 8, { pad: 12 }); add(t, await totals(334, SUB, 6), "h"); add(b, t, "h")
  add(b, await methodsCard(W, sel, err, 12, 6, "Label/M"), "h")
  add(b, await T(TERMS, "Body/M", "ink-2", W), "h")
  fillSp(b); add(b, await button(label, "primary", bs), "h")
}
const pm = await mobileScreen({ path: "Checkout/Payment", header: { type: "page", title: "الدفع والمراجعة" }, gap: 8 }); await fillPayM(pm.body, "Default"); ar(pm.screen, PAY.Default[4])
const pmS = []
for (const st of ["Filled", "Processing", "Failed", "Disabled"]) {
  const s = stateCopy(pm, st === "Filled" ? "Filled" : st === "Processing" ? "Processing" : st === "Failed" ? "Failed" : "Disabled"); await fillPayM(s.body, st); ar(s.screen, PAY[st][4])
  if (st === "Failed") overlay(s.screen, await toast("error", DECLINED), 24, 100)
  pmS.push(s.screen)
}
await screenSection(ctx, PM, "sec-ord-payment-m", "الدفع والمراجعة · Payment and review", async S => { S.main.push(pm.screen); S.states.push(...pmS) })

async function summaryRows(w) {
  const c = frame("order facts", { w, gap: 12 })
  add(c, await irow("calendar-check", "ذبح وتجهيز طازج صباح الأربعاء", "11 نوفمبر 2026 · بإشراف مجازر الفلاح", w), "h")
  add(c, await irow("truck", "توصيل بين 4:00 و6:00 م", "حي الملقا، الرياض", w), "h")
  add(c, await irow("receipt", "338.00 ر.س شامل الضريبة", "مدى · تنتهي بـ 4821", w), "h")
  return c
}
const ok = async () => { const ring = frame("ok", { dir: "HORIZONTAL", w: 88, h: 88, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" }); add(ring, await icon("check-circle", 48, "success", "fill")); return ring }
const plm = await mobileScreen({ path: "Checkout/Placed", header: null, gap: 12 }); ar(plm.screen, "تم الطلب")
{
  const col = frame("done", { w: 358, gap: 12, cross: "CENTER" })
  add(col, await ok()); add(col, await T("تم استلام طلبك", "Heading/H1", "ink", 358, "CENTER")); add(col, await T("رقم الطلب #10482", "Heading/H3", "ink", 358, "CENTER"))
  mid(plm.body, col)
  const c = card(358, 12); add(c, await summaryRows(326), "h"); add(plm.body, c, "h")
  fillSp(plm.body); add(plm.body, await button("تتبع الطلب", "primary"), "h"); add(plm.body, await button("العودة للرئيسية", "ghost"), "h")
}
await screenSection(ctx, PM, "sec-ord-placed-m", "تم الطلب · Order placed", async S => { S.main.push(plm.screen) })

// ================================ Web ================================
const CARD_W = 760, IN_W = 712, SUM_W = 416, SIN = 368
async function webCols(b, title, left, right) {
  add(b, await T(title, "Display/L", "ink", 1200), "h")
  const row = frame("columns", { dir: "HORIZONTAL", w: 1200, gap: 24 }); add(row, left); add(row, right); add(b, row, "h")
}
async function webCart(state, view) {
  const w = await webScreen({ path: "Cart/Cart", state, active: 1 }), b = w.body, dis = view === "disabled"
  if (view === "empty" || view === "error") {
    add(b, await T("السلة", "Display/L", "ink", 1200), "h")
    const p = view === "empty" ? await panel("cart", "سلتك فارغة", "أضف منتجات من المتاجر وسنجهّزها لك طازجة.", "تصفّح المنتجات") : await panel("error", "تعذّر تحميل السلة", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة")
    const m = frame("center", { dir: "HORIZONTAL", main: "CENTER", cross: "CENTER", w: 1200, h: 440 }); m.appendChild(p); add(b, m, "h"); return w
  }
  const left = frame("lines", { w: CARD_W, gap: 16 }), sum = card(SUM_W, 16, { pad: 24 })
  add(sum, await T("ملخص الطلب", "Heading/H2", "ink", SIN), "h")
  if (view === "loading") {
    const sk = card(CARD_W, 16, { pad: 24 }); for (const s of skels(IN_W, [96, 96])) add(sk, s, "h"); add(left, sk, "h")
    for (const s of skels(SIN, [24, 24, 24, 24])) add(sum, s, "h")
  } else {
    if (dis) add(left, await noticeCard(CARD_W), "h")
    add(left, await linesCard(CARD_W, dis ? DIS_LINES : LINES, 96, true, 24), "h"); add(left, await promoCard(CARD_W, 24), "h")
    add(sum, await totals(SIN, dis ? SUB_DIS : SUB, 12), "h")
  }
  add(sum, await button("متابعة إلى الدفع", "primary", dis || view === "loading" ? "disabled" : "default"), "h")
  await webCols(b, "السلة", left, sum); return w
}
const cw = await webCart("Default", "normal"); ar(cw.screen, "السلة")
const cwS = [[await webCart("Empty", "empty"), "السلة · فارغة"], [await webCart("Loading", "loading"), "السلة · تحميل"], [await webCart("Error", "error"), "السلة · خطأ"], [await webCart("Disabled", "disabled"), "السلة · معطّلة"]]
cwS.forEach(([x, n]) => ar(x.screen, n))
await screenSection(wctx, PW, "sec-ord-cart-w", "السلة (ويب) · Cart (web)", async S => { S.main.push(cw.screen); S.states.push(...cwS.map(x => x[0].screen)) })

async function webPay(state) {
  const [sel, err, label, bs, arName] = PAY[state], w = await webScreen({ path: "Checkout/Payment", state, active: 1 }), b = w.body
  const left = frame("form", { w: CARD_W, gap: 16 })
  if (state === "Failed") add(left, await toast("error", DECLINED))
  add(left, await methodsCard(CARD_W, sel, err, 24, 8, "Heading/H2"), "h")
  const rv = card(CARD_W, 16, { pad: 24 }); add(rv, await T("مراجعة الطلب", "Heading/H2", "ink", IN_W), "h")
  for (const L of LINES) {
    const r = frame("item", { dir: "HORIZONTAL", w: IN_W, gap: 16, cross: "CENTER" }); add(r, await photo(L.key, 56, 56, "sm"))
    const c = frame("copy", { gap: 2, w: IN_W - 72 - 120 }); add(c, await T(L.name + " × " + L.qty, "Label/M", "ink", c.width), "h"); add(c, await T(L.opt, "Body/M", "ink-2", c.width), "h")
    add(r, c); add(r, await T(sar(L.qty * L.unit), "Label/M", "ink", 100, "LEFT")); add(rv, r, "h")
  }
  add(rv, rect("divider", IN_W, 1, "line"), "h")
  add(rv, await irow("truck", "الأربعاء 11 نوفمبر · 4:00 – 6:00 م", "توصيل بواسطة مجازر الفلاح", IN_W), "h")
  add(rv, await irow("map-pin", "المنزل · حي الملقا", "الرياض، طريق أنس بن مالك", IN_W), "h"); add(left, rv, "h")
  const sum = card(SUM_W, 16, { pad: 24 }); add(sum, await T("ملخص الدفع", "Heading/H2", "ink", SIN), "h")
  add(sum, await totals(SIN, SUB, 12), "h"); add(sum, await T(TERMS, "Body/M", "ink-2", SIN), "h"); add(sum, await button(label, "primary", bs), "h")
  await webCols(b, "إتمام الطلب", left, sum)
  b.insertChild(1, await stepRow(1200, 2, "الدفع والمراجعة")); b.children[1].layoutSizingHorizontal = "FILL"
  return ar(w.screen, arName) && w
}
const pw = await webPay("Default"), pwS = []
for (const st of ["Filled", "Processing", "Failed", "Disabled"]) pwS.push(await webPay(st))
await screenSection(wctx, PW, "sec-ord-payment-w", "الدفع والمراجعة (ويب) · Payment and review (web)", async S => { S.main.push(pw.screen); S.states.push(...pwS.map(x => x.screen)) })

const plw = await webScreen({ path: "Checkout/Placed", active: 1 }); ar(plw.screen, "تم الطلب")
{
  const c = card(560, 16, { pad: 40, cross: "CENTER" })
  add(c, await ok()); add(c, await T("تم استلام طلبك", "Display/L", "ink", 480, "CENTER")); add(c, await T("رقم الطلب #10482", "Heading/H2", "ink", 480, "CENTER"))
  add(c, await summaryRows(480), "h")
  const r = frame("actions", { dir: "HORIZONTAL", w: 480, gap: 12 }); add(r, await button("تتبع الطلب", "primary"), "h"); add(r, await button("العودة للرئيسية", "secondary"), "h"); add(c, r, "h")
  const m = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 1200 }); m.appendChild(c); add(plw.body, m, "h")
}
await screenSection(wctx, PW, "sec-ord-placed-w", "تم الطلب (ويب) · Order placed (web)", async S => { S.main.push(plw.screen) })

print(`ORD sections: ${ctx.ids.length + wctx.ids.length}, contrast checks: ${DS.pairs.length}, failing: ${DS.pairs.filter(p => !p.ok).length}\n` + [...ctx.ids, ...wctx.ids].join("\n") + "\n" + contrastReport())
