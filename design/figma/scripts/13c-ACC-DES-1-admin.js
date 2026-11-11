// ACC-DES-1 batch 3 (admin, part c): dashboard login (staff phone + OTP), centered card on brand-deep, no side nav. Page 30 Admin.
// Components only. Arabic RTL. Prototype links are wired elsewhere.
await loadDS()
const ctx = { y: 0 }
const P = "30 Admin"
await page(P).loadAsync()
{ const own = ["sec-acc-admin-login-phone", "sec-acc-admin-login-otp"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

async function adminLogin(path, state, build) {
  const s = frame(`Admin/${path} — ${state}`, { w: 1440, h: 900, fill: "brand-deep", main: "CENTER", cross: "CENTER", clip: true })
  s.setSharedPluginData(NS, "screen", path)
  const col = frame("login", { gap: 24, cross: "CENTER" })
  const brand = frame("brand", { gap: 4, cross: "CENTER" })
  add(brand, await txt("جزلة", "Display/L", "gold-light", { align: "CENTER" })); add(brand, await txt("لوحة تحكم الموظفين", "Body/M", "sand", { align: "CENTER" }))
  add(col, brand)
  const card = frame("card", { w: 422, pad: 32, gap: 24, fill: "paper", r: "lg" })
  await build(card); add(col, card)
  add(s, col)
  chk("admin brand", "gold-light", "brand-deep"); chk("admin tagline", "sand", "brand-deep"); chk("admin card text", "ink", "paper"); chk("admin card sub", "ink-2", "paper")
  return s
}
// ---- Phone ---------------------------------------------------------------------------------------------------
async function phoneCard(c, phoneState, btn, err) {
  add(c, await titleBlock("تسجيل دخول الموظفين", "أدخل رقم جوالك المسجّل لدى الإدارة."), "h")
  const p = inst("phone-input", { state: phoneState })
  if (err) await retext(p, "رقم الجوال غير مكتمل", "هذا الرقم غير مسجّل كموظف")
  if (btn === "loading") phoneValue(p)
  add(c, p, "h")
  add(c, await button("إرسال الرمز", "primary", btn), "h")
  add(c, await txt("هذه اللوحة للموظفين المصرّح لهم فقط.", "Body/M", "ink-2", { w: 358 }), "h")
}
const ph = await adminLogin("Login/Phone", "Default", c => phoneCard(c, "default", "disabled"))
const phErr = await adminLogin("Login/Phone", "Error", c => phoneCard(c, "error", "disabled", true))
const phLoad = await adminLogin("Login/Phone", "Loading", c => phoneCard(c, "default", "loading"))
await screenSection(ctx, P, "sec-acc-admin-login-phone", "دخول الإدارة، الجوال · Admin login phone", async S => { S.main.push(ph); S.states.push(phErr, phLoad) })

// ---- OTP -----------------------------------------------------------------------------------------------------
async function otpCard(c, otpState, resend, btn) {
  add(c, await titleBlock("أدخل رمز التحقق", "أرسلنا رمزًا من 4 أرقام إلى +966 55 123 4567"), "h")
  const row = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 358 }); row.appendChild(inst("otp-field", { state: otpState })); add(c, row, "h")
  add(c, await button(resend, "ghost", resend.includes("بعد") ? "disabled" : "default", "S"))
  add(c, await button("تأكيد", "primary", btn), "h")
}
const ot = await adminLogin("Login/OTP", "Default", c => otpCard(c, "default", "إعادة الإرسال بعد 00:30", "disabled"))
const otErr = await adminLogin("Login/OTP", "Error", c => otpCard(c, "error", "إعادة إرسال الرمز", "default"))
const otLoad = await adminLogin("Login/OTP", "Loading", c => otpCard(c, "filled", "إعادة الإرسال بعد 00:05", "loading"))
await screenSection(ctx, P, "sec-acc-admin-login-otp", "دخول الإدارة، الرمز · Admin login OTP", async S => { S.main.push(ot); S.states.push(otErr, otLoad) })

print("✅ ACC admin login done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
