// DSN-DES-1, batch 4: logo section on 01 Foundations. Two options (A ram in shield as approved, B same ram in a round medallion),
// each with AR and EN lockups on dark and light, iOS app icon, Android adaptive icon, favicons, splash.
// The emblem comes from docs/design/brand/*.svg (fetched at the pinned commit), so the repo file stays the single source.
await loadDS()
const ctx = { y: 0 }
{ const pg = page("01 Foundations"); await pg.loadAsync()
  ctx.y = Math.max(...pg.children.filter(n => n.getSharedPluginData(NS, "id") !== "sec-logo").map(n => n.y + n.height)) + 200 }
const BR = B.replace("design/figma/scripts/", "docs/design/brand/")
const svgText = async f => (await (await fetch(BR + f)).text())
const goldStyle = (await figma.getLocalPaintStylesAsync()).find(s => s.name === "Brand/Gold gradient")
const MESS = { family: "El Messiri", style: "Bold" }, READ = { family: "Readex Pro", style: "Medium" }
await fonts(MESS, READ)

function emblem(svg, h, name) {
  const n = figma.createNodeFromSvg(svg); n.name = name
  const k = h / n.height; n.resize(n.width * k, h); n.clipsContent = false
  return n
}
async function word(str, font, size, dark, gradient, spacing = 0) {
  const t = figma.createText(); t.fontName = font; t.fontSize = size; t.characters = str; t.name = str
  t.letterSpacing = { unit: "PIXELS", value: spacing }
  if (gradient && dark) await t.setFillStyleIdAsync(goldStyle.id); else t.fills = [paint(gradient ? "brand" : dark ? "gold-light" : "gold-text")]
  return t
}
// lockup in visual left-to-right order: AR = text on the left and emblem on the right (RTL start), EN = emblem left
async function lockup(svg, lang, dark) {
  const bg = dark ? "brand-deep" : "bg"
  const f = frame(`lockup ${lang} ${dark ? "dark" : "light"}`, { dir: "HORIZONTAL", ltr: true, gap: 24, px: 48, py: 40, cross: "CENTER", fill: bg, stroke: dark ? null : "line", r: "lg" })
  const e = emblem(svg, 150, "emblem")
  const t = frame("text", { gap: 4, cross: lang === "ar" ? "MAX" : "MIN", ltr: true })
  if (lang === "ar") { t.appendChild(await word("جزلة", MESS, 96, dark, true)); t.appendChild(await word("JAZLAH", READ, 24, dark, false, 9)) }
  else { t.appendChild(await word("Jazlah", MESS, 96, dark, true)); t.appendChild(await word("جزلة", READ, 28, dark, false)) }
  if (lang === "ar") { f.appendChild(t); f.appendChild(e) } else { f.appendChild(e); f.appendChild(t) }
  return f
}
function tile(name, w, h, fillKey, r) { return frame(name, { dir: "HORIZONTAL", ltr: true, w, h, main: "CENTER", cross: "CENTER", fill: fillKey, r }) }

async function option(body, key, title, file) {
  const svg = await svgText(file)
  const o = frame("Logo/" + title, { gap: 24, pad: 32, fill: "paper", stroke: "line", r: "lg", w: 1200 })
  add(o, await txt(title, "Heading/H1"), "h")
  add(o, await txt("الأصل مرفق في docs/design/brand. الشعار الذهبي بالتدرّج للهوية فقط، ولا يُستخدم في واجهة المحتوى.", "Body/M", "ink-2", { w: 1136 }), "h")

  add(o, await txt("التركيبة · Lockups", "Heading/H3"), "h")
  const r1 = frame("lockups", { dir: "HORIZONTAL", ltr: true, gap: 24 }); r1.layoutWrap = "WRAP"; r1.counterAxisSpacing = 24
  for (const [lang, dark] of [["ar", true], ["en", true], ["ar", false], ["en", false]]) r1.appendChild(await lockup(svg, lang, dark))
  o.appendChild(r1); r1.layoutSizingHorizontal = "FILL"

  add(o, await txt("الأيقونات · App icon (iOS)، Android adaptive، Favicon", "Heading/H3"), "h")
  const r2 = frame("icons", { dir: "HORIZONTAL", ltr: true, gap: 40, cross: "MAX" })
  const ios = tile("app icon iOS 1024 (squircle)", 256, 256, "brand-deep", 58); ios.appendChild(emblem(svg, 170, "emblem")); r2.appendChild(ios)
  const ad = tile("app icon Android adaptive (108dp, safe zone 66)", 256, 256, "brand-deep", 0); ad.clipsContent = true
  const fg = emblem(svg, 120, "emblem (foreground, inside safe zone)"); ad.appendChild(fg)
  const guide = figma.createEllipse(); guide.name = "safe zone guide"; guide.resize(169, 169); guide.fills = []; guide.strokes = [paint("gold-light")]; guide.strokeWeight = 1; guide.dashPattern = [6, 4]
  ad.appendChild(guide); guide.layoutPositioning = "ABSOLUTE"; guide.x = 43.5; guide.y = 43.5; r2.appendChild(ad)
  const fav = frame("favicons", { dir: "HORIZONTAL", ltr: true, gap: 16, cross: "MAX" })
  for (const px of [96, 48, 32, 16]) { const t = tile(`favicon ${px}`, px, px, "brand-deep", Math.round(px / 5)); t.appendChild(emblem(svg, Math.round(px * 0.78), "emblem")); fav.appendChild(t) }
  r2.appendChild(fav); o.appendChild(r2)

  add(o, await txt("شاشة البداية · Splash (390 × 844)", "Heading/H3"), "h")
  const sp = frame("Splash — " + key, { w: 390, h: 844, main: "CENTER", cross: "CENTER", gap: 20, fill: "brand-deep", r: "lg" })
  sp.appendChild(emblem(svg, 150, "emblem"))
  sp.appendChild(await word("جزلة", MESS, 72, true, true))
  sp.appendChild(await word("JAZLAH", READ, 22, true, false, 9))
  sp.appendChild(await txt("لحوم ومواشي طازجة من أفضل المتاجر", "Body/M", "sand", { align: "CENTER" }))
  o.appendChild(sp)
  chk("splash tagline", "sand", "brand-deep"); chk("logo EN subtitle on dark", "gold-light", "brand-deep"); chk("logo AR subtitle on light", "gold-text", "bg")
  body.appendChild(o)
  return o
}

const nodes = {}
await sectionOn(ctx, "01 Foundations", "sec-logo", "الشعار · Logo", async body => {
  add(body, await txt("خياران للعميل: (A) الكبش في الدرع كما وافق عليه، و(B) نفس الكبش داخل ميدالية دائرية. الاختيار والموافقة الكتابية على «جزلة / Jazlah» بانتظار العميل.", "Body/L", "ink-2", { w: 1200 }), "h")
  chk("logo section intro", "ink-2", "bg")
  nodes.A = await option(body, "A", "الخيار A — الكبش في الدرع · Option A, ram in shield", "emblem-a-shield.svg")
  nodes.B = await option(body, "B", "الخيار B — الكبش في ميدالية · Option B, roundel", "emblem-b-roundel.svg")
}, 1280)
figma.viewport.scrollAndZoomIntoView([page("01 Foundations").findOne(n => n.getSharedPluginData(NS, "id") === "sec-logo")])
print("✅ batch 4 done\n" + ctx.ids.join("\n") + "\nOption A " + nodes.A.id + "\nOption B " + nodes.B.id + "\n" + contrastReport())
