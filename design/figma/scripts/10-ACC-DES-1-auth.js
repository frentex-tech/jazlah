// ACC-DES-1 batch 1 (mobile): onboarding (3 slides), phone entry, OTP (resend timer, error), complete profile.
// Page 10 Customer App. Built only from design-system components through the templates in _ds.js. Arabic RTL. States are copies of the base screen.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App"
await page(P).loadAsync()
{ const own = ["sec-acc-onboarding", "sec-acc-phone", "sec-acc-otp", "sec-acc-profile"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

const dots = (active) => { const r = frame("dots", { dir: "HORIZONTAL", ltr: true, gap: 8, cross: "CENTER" }); for (let i = 0; i < 3; i++) r.appendChild(i === active ? rect("dot", 28, 8, "ember", "pill") : rect("dot", 8, 8, "line", "pill")); return r }

// ---- Onboarding: 3 slides -------------------------------------------------------------------------
const SLIDES = [
  ["لحوم طازجة من أفضل المتاجر", "اختر من متاجر موثّقة، واعرف وقت الذبح وجودة كل قطعة قبل أن تطلب."],
  ["وصّل طلبك في يومك", "حدّد يوم التوصيل المناسب لك، وتابع طلبك لحظة بلحظة حتى باب البيت."],
  ["لكل مناسبة ما يناسبها", "ولائم وعقائق وأضاحٍ وزيارات مزارع، ونطبخها لك إن أردت."],
]
const slides = []
for (let i = 0; i < 3; i++) {
  const { screen, body } = await mobileScreen({ path: `Onboarding/Slide ${i + 1}`, pad: 24, gap: 16 })
  const brandRow = frame("brand", { dir: "HORIZONTAL", w: 342, gap: 8, cross: "CENTER" })
  add(brandRow, await emblemNode(44)); add(brandRow, await txt("جزلة", "Display/L", "brand")); add(body, brandRow, "h")
  const img = frame("photo", { dir: "HORIZONTAL", w: 342, h: 300, main: "CENTER", cross: "CENTER", fill: "sand", r: "lg" })
  add(img, await icon("image", 56, "ink-2")); img.setSharedPluginData(NS, "photo", ["lamb-spit", "butchers", "mandi"][i]); add(body, img, "h"); img.layoutSizingVertical = "FILL"
  add(body, dots(i))
  add(body, await titleBlock(SLIDES[i][0], SLIDES[i][1]), "h")
  add(body, await button(i === 2 ? "ابدأ الآن" : "التالي"), "h")
  if (i < 2) add(body, await button("تخطي", "ghost"), "h")
  slides.push({ screen, body })
}
await screenSection(ctx, P, "sec-acc-onboarding", "التعريف · Onboarding", async S => {
  for (const s of slides) S.main.push(s.screen)
  S.states.push(stateCopy({ screen: slides[0].screen }, "Loading", false).screen)
  // loading: skeleton in place of the photo and text
  const st = S.states[0]; const b = st.findOne(n => n.name === "body"); add(b, rect("photo skeleton", 342, 380, "sand", "lg")); add(b, await skeletonRows(2), "h")
})

// ---- Phone entry --------------------------------------------------------------------------------------
const phone = await authScreen({ path: "Login/Phone", heroH: 300 })
add(phone.body, await titleBlock("أهلًا بك في جزلة", "أدخل رقم جوالك وسنرسل لك رمز التحقق."), "h")
add(phone.body, inst("phone-input", { state: "default" }), "h")
add(phone.body, await txt("بالمتابعة فأنت توافق على الشروط وسياسة الخصوصية.", "Body/M", "ink-2", { w: 358 }), "h")
{ const sp = spacer(); add(phone.body, sp); sp.layoutSizingVertical = "FILL" }
add(phone.body, await button("إرسال الرمز", "primary", "disabled"), "h")
const phoneErr = stateCopy(phone, "Error"); add(phoneErr.body, await titleBlock("أهلًا بك في جزلة", "أدخل رقم جوالك وسنرسل لك رمز التحقق."), "h")
{ const e = inst("phone-input", { state: "error" }); await retext(e, "رقم الجوال غير مكتمل", "أدخل رقم جوال سعودي صحيح مكوّن من 9 أرقام"); add(phoneErr.body, e, "h")
  const sp = spacer(); add(phoneErr.body, sp); sp.layoutSizingVertical = "FILL"; add(phoneErr.body, await button("إرسال الرمز", "primary", "disabled"), "h") }
const phoneLoad = stateCopy(phone, "Loading"); add(phoneLoad.body, await titleBlock("أهلًا بك في جزلة", "أدخل رقم جوالك وسنرسل لك رمز التحقق."), "h")
{ add(phoneLoad.body, phoneValue(inst("phone-input", { state: "default" })), "h"); const sp = spacer(); add(phoneLoad.body, sp); sp.layoutSizingVertical = "FILL"; add(phoneLoad.body, await button("إرسال الرمز", "primary", "loading"), "h") }
const phoneFilled = stateCopy(phone, "Filled"); add(phoneFilled.body, await titleBlock("أهلًا بك في جزلة", "أدخل رقم جوالك وسنرسل لك رمز التحقق."), "h")
{ add(phoneFilled.body, phoneValue(inst("phone-input", { state: "default" })), "h"); const sp = spacer(); add(phoneFilled.body, sp); sp.layoutSizingVertical = "FILL"; add(phoneFilled.body, await button("إرسال الرمز", "primary", "default"), "h") }
await screenSection(ctx, P, "sec-acc-phone", "رقم الجوال · Phone entry", async S => { S.main.push(phone.screen); S.states.push(phoneFilled.screen, phoneErr.screen, phoneLoad.screen) })

// ---- OTP ------------------------------------------------------------------------------------------------
const base = await authScreen({ path: "Login/OTP", heroH: 240, back: true, photo: "butchers" })
async function fillOtp(b, otpState, hint, resendLabel, resendVariant, btnState) {
  add(b, await titleBlock("أدخل رمز التحقق", "أرسلنا رمزًا من 4 أرقام إلى +966 55 123 4567"), "h")
  const o = inst("otp-field", { state: otpState })
  const c = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 358 }); c.appendChild(o); add(b, c, "h")
  add(b, await button(resendLabel, resendVariant, resendVariant === "ghost" && resendLabel.includes("بعد") ? "disabled" : "default", "S"))
  const sp = spacer(); add(b, sp); sp.layoutSizingVertical = "FILL"
  add(b, await button("تأكيد", "primary", btnState), "h")
}
await fillOtp(base.body, "default", null, "إعادة الإرسال بعد 00:30", "ghost", "disabled")
const otpFilled = stateCopy(base, "Filled"); await fillOtp(otpFilled.body, "filled", null, "إعادة الإرسال بعد 00:12", "ghost", "default")
const otpErr = stateCopy(base, "Error"); await fillOtp(otpErr.body, "error", null, "إعادة إرسال الرمز", "ghost", "default")
const otpLoad = stateCopy(base, "Loading"); await fillOtp(otpLoad.body, "filled", null, "إعادة الإرسال بعد 00:05", "ghost", "loading")
await screenSection(ctx, P, "sec-acc-otp", "رمز التحقق · OTP", async S => { S.main.push(base.screen); S.states.push(otpFilled.screen, otpErr.screen, otpLoad.screen) })

// ---- Complete profile ------------------------------------------------------------------------------------
async function fillProfile(b, nameState, btn) {
  add(b, await titleBlock("أكمل ملفك", "نحتاج اسمك لنُجهّز طلباتك ونتواصل معك."), "h")
  add(b, await field("الاسم الكامل", nameState === "error" ? "اكتب هنا" : null, nameState, nameState === "error" ? "الاسم مطلوب" : undefined), "h")
  add(b, await field("البريد الإلكتروني (اختياري)", nameState === "default" ? null : "name@example.com", nameState === "default" ? "default" : "filled", "لن نرسل لك إلا إشعارات طلباتك"), "h")
  const consent = inst("checkbox", { checked: "no", state: "default" }); await retext(consent, "إضافة تغليف هدية", "أوافق على استلام العروض والأخبار"); add(b, consent)
  const sp = spacer(); add(b, sp); sp.layoutSizingVertical = "FILL"
  add(b, await button("حفظ ومتابعة", "primary", btn), "h")
}
const prof = await authScreen({ path: "Login/Profile", heroH: 220, back: true, photo: "mandi" })
await fillProfile(prof.body, "default", "disabled")
const profFilled = stateCopy(prof, "Filled"); await fillProfile(profFilled.body, "filled", "default")
const profErr = stateCopy(prof, "Error"); await fillProfile(profErr.body, "error", "disabled")
const profLoad = stateCopy(prof, "Loading"); await fillProfile(profLoad.body, "filled", "loading")
await screenSection(ctx, P, "sec-acc-profile", "إكمال الملف · Complete profile", async S => { S.main.push(prof.screen); S.states.push(profFilled.screen, profErr.screen, profLoad.screen) })

print("✅ ACC auth done (prototype links are in 11-ACC-DES-1-proto.js)\n" + ctx.ids.join("\n") + "\n" + contrastReport())
