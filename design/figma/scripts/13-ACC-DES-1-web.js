// ACC-DES-1 batch 3 (web, part a): login (phone), OTP, complete profile, 1440 wide. Page 20 Customer Web.
// Components and templates only. Arabic RTL. Prototype links are wired elsewhere.
await loadDS()
const ctx = { y: 0 }
const P = "20 Customer Web"
// ---- shared helpers (duplicated across the 13 files) ----
async function pageY(ctx, pageName, own) {
  await page(pageName).loadAsync()
  const rest = page(pageName).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0
}
// centered 422-wide card (358 inner) inside the 1200 web body
function webCard(b, h = 520) {
  const row = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 1200, h, cross: "CENTER" })
  const c = frame("card", { w: 422, pad: 32, gap: 24, fill: "paper", stroke: "line", r: "lg" })
  row.appendChild(c); add(b, row, "h")
  return c
}
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
ctx.y = await pageY(ctx, P, ["sec-acc-web-login", "sec-acc-web-otp", "sec-acc-web-profile"])

async function webAuth(path, state, build) {
  const w = await webScreen({ path, state, active: 3 })
  await build(webCard(w.body))
  chk("web auth card", "ink", "paper"); chk("web auth card sub", "ink-2", "paper")
  return w.screen
}
// ---- Login (phone) ---------------------------------------------------------------------------------------
async function loginCard(c, phoneState, btn, err) {
  add(c, await titleBlock("أهلًا بك في جزلة", "أدخل رقم جوالك وسنرسل لك رمز التحقق."), "h")
  const p = inst("phone-input", { state: phoneState })
  if (err) await retext(p, "رقم الجوال غير مكتمل", "أدخل رقم جوال سعودي صحيح مكوّن من 9 أرقام")
  add(c, p, "h")
  add(c, await txt("بالمتابعة فأنت توافق على الشروط وسياسة الخصوصية.", "Body/M", "ink-2", { w: 358 }), "h")
  add(c, await button("إرسال الرمز", "primary", btn), "h")
}
const lg = await webAuth("Login/Phone", "Default", c => loginCard(c, "default", "disabled"))
const lgErr = await webAuth("Login/Phone", "Error", c => loginCard(c, "error", "disabled", true))
const lgLoad = await webAuth("Login/Phone", "Loading", c => loginCard(c, "default", "loading"))
await screenSection(ctx, P, "sec-acc-web-login", "تسجيل الدخول · Web login", async S => { S.main.push(lg); S.states.push(lgErr, lgLoad) })

// ---- OTP --------------------------------------------------------------------------------------------------
async function otpCard(c, otpState, resend, btn) {
  add(c, await titleBlock("أدخل رمز التحقق", "أرسلنا رمزًا من 4 أرقام إلى +966 5X XXX XXXX"), "h")
  const row = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 358 }); row.appendChild(inst("otp-field", { state: otpState })); add(c, row, "h")
  add(c, await button(resend, "ghost", resend.includes("بعد") ? "disabled" : "default", "S"))
  add(c, await button("تأكيد", "primary", btn), "h")
}
const ot = await webAuth("Login/OTP", "Default", c => otpCard(c, "default", "إعادة الإرسال بعد 00:30", "disabled"))
const otErr = await webAuth("Login/OTP", "Error", c => otpCard(c, "error", "إعادة إرسال الرمز", "default"))
const otLoad = await webAuth("Login/OTP", "Loading", c => otpCard(c, "filled", "إعادة الإرسال بعد 00:05", "loading"))
await screenSection(ctx, P, "sec-acc-web-otp", "رمز التحقق · Web OTP", async S => { S.main.push(ot); S.states.push(otErr, otLoad) })

// ---- Complete profile ---------------------------------------------------------------------------------------
async function profCard(c, nameState, btn) {
  add(c, await titleBlock("أكمل ملفك", "نحتاج اسمك لنُجهّز طلباتك ونتواصل معك."), "h")
  add(c, await field("الاسم الكامل", nameState === "error" ? "اكتب هنا" : null, nameState, nameState === "error" ? "الاسم مطلوب" : undefined), "h")
  add(c, await field("البريد الإلكتروني (اختياري)", null, "default", "لن نرسل لك إلا إشعارات طلباتك"), "h")
  const k = inst("checkbox", { checked: "no", state: "default" }); await retext(k, "إضافة تغليف هدية", "أوافق على استلام العروض والأخبار"); add(c, k)
  add(c, await button("حفظ ومتابعة", "primary", btn), "h")
}
const pf = await webAuth("Login/Profile", "Default", c => profCard(c, "default", "disabled"))
const pfErr = await webAuth("Login/Profile", "Error", c => profCard(c, "error", "disabled"))
const pfLoad = await webAuth("Login/Profile", "Loading", c => profCard(c, "filled", "loading"))
await screenSection(ctx, P, "sec-acc-web-profile", "إكمال الملف · Web complete profile", async S => { S.main.push(pf); S.states.push(pfErr, pfLoad) })

print("✅ ACC web (a) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
