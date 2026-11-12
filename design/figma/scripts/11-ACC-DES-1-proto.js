// ACC-DES-1: prototype links for the first-launch flow (onboarding -> phone -> OTP -> profile). Separate script: reactions are slow to set.
await loadDS()
const P = "10 Customer App"
await page(P).loadAsync()
const pg = page(P)
const S = n => pg.findOne(x => x.type === "FRAME" && x.name === n)
const slides = [1, 2, 3].map(i => S(`App/Onboarding/Slide ${i} — Default`))
const phone = S("App/Login/Phone — Filled"), otp = S("App/Login/OTP — Filled"), prof = S("App/Login/Profile — Filled")
const wires = [[slides[0], "التالي", slides[1]], [slides[1], "التالي", slides[2]], [slides[2], "ابدأ الآن", phone], [phone, "إرسال الرمز", otp], [otp, "تأكيد", prof]]
for (const [from, label, to] of wires) {
  const b = findButton(from, label)
  if (!b || !to) { print("⚠️ missing " + label + " in " + (from && from.name)); continue }
  const t0 = Date.now()
  await Promise.race([tap(b, to), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000))]).then(() => print("linked " + label + " " + (Date.now() - t0) + "ms")).catch(e => print("❌ " + label + " " + e.message))
}
flowStart(P, slides[0], "ACC: first launch to profile")
print("✅ ACC proto done, reactions: " + pg.findAll(n => n.reactions && n.reactions.length > 0).length)
