// Wires the regular-order prototype across pages (home -> product -> checkout step 1), sets the flow start on page 10 and
// links it from the "Regular order" flow on 90 Flows with a hyperlink. Cart, payment and tracking screens belong to later tasks.
await loadDS()
const p10 = page("10 Customer App"); await p10.loadAsync()
const F = n => p10.findOne(x => x.type === "FRAME" && x.name === n)
const home = F("App/Home/Home — Default"), prod = F("App/Product/Detail — Default"), chk1 = F("App/Checkout/Fulfilment — Default")
const T = (p, ms = 20000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))])
const out = []
if (home && prod) {
  const card = home.findOne(n => n.type === "INSTANCE" && n.name === "Product card")
  if (card) { await T(tap(card, prod)).then(() => out.push("home→product ok")).catch(e => out.push("home→product " + e.message)) } else out.push("no product card")
}
if (prod && chk1) {
  const add = findButton(prod, "أضف إلى السلة")
  if (add) { await T(tap(add, chk1)).then(() => out.push("product→checkout ok")).catch(e => out.push("product→checkout " + e.message)) } else out.push("no add button")
}
if (home) flowStart("10 Customer App", home, "Regular order: home → product → checkout")
// hyperlink on 90 Flows
const p90 = page("90 Flows"); await p90.loadAsync()
const title = p90.findOne(n => n.type === "TEXT" && n.characters.startsWith("الطلب العادي"))
if (title && home) {
  const t = await txt("▶ شغّل النموذج التفاعلي (الرئيسية ← المنتج ← الدفع، الخطوة 1)", "Label/M", "ember"); title.parent.insertChild(title.parent.children.indexOf(title) + 1, t)
  t.setRangeHyperlink(0, t.characters.length, { type: "NODE", value: home.id }); out.push("link on 90 Flows ok")
} else out.push("90 Flows title not found")
print("FLOW " + out.join("; ") + " home=" + (home && home.id) + " prod=" + (prod && prod.id) + " chk=" + (chk1 && chk1.id))
