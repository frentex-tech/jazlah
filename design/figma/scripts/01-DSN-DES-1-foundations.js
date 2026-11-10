// DSN-DES-1, batch 1: file structure, variables (from tokens.json), text/effect/paint styles, Foundations page.
// Re-runnable: variables and styles are found by name, Foundations sections are rebuilt in place.
// no loadAllPagesAsync: with 10+ populated pages it takes over a minute; setCurrentPageAsync loads the page we touch

// ---- 0. inputs -------------------------------------------------------------
const T = await (await fetch(B.replace("design/figma/scripts/", "docs/design/tokens.json"))).json() // B = scripts URL pinned to the commit, passed by the loader

const TYPE = [ // [style name, family, weight, variable, size, line-height %]
  ["Display/XL", "El Messiri", "Bold", "display-xl", 36, 130],
  ["Display/L", "El Messiri", "Bold", "display-l", 28, 130],
  ["Heading/H1", "Readex Pro", "SemiBold", "h1", 24, 150],
  ["Heading/H2", "Readex Pro", "SemiBold", "h2", 20, 150],
  ["Heading/H3", "Readex Pro", "Medium", "h3", 18, 150],
  ["Body/L", "Readex Pro", "Regular", "body-l", 16, 160],
  ["Body/M", "Readex Pro", "Regular", "body-m", 14, 160], // 14 = minimum for Arabic body copy
  ["Label/M", "Readex Pro", "Medium", "label-m", 14, 150],
  ["Caption", "Readex Pro", "Regular", "caption", 12, 150],
]
const AR = { brand: "العنابي الأساسي", "brand-2": "عنابي — ضغط", "brand-deep": "عنابي داكن", gold: "ذهبي", "gold-text": "ذهبي للنص", "gold-light": "ذهبي فاتح", "gold-deco": "ذهبي — زخرفة فقط", "muted-soft": "باهت — كبير/معطّل فقط", danger: "خطر (أخطاء)", "danger-bg": "خلفية الخطأ", warning: "تحذير", "warning-bg": "خلفية التحذير",
  ember: "أحمر الإجراء (CTA)", "ember-2": "أحمر — ضغط", bg: "كريمي — الخلفية", paper: "ورقي — البطاقات", sand: "رملي", line: "خط فاصل",
  ink: "حبر — النص", "ink-2": "حبر ثانوي", muted: "باهت", success: "نجاح", info: "معلومة" }
const GROUPS = [["العنابي · Brand", ["brand", "brand-2", "brand-deep"]], ["الذهبي · Gold", ["gold", "gold-text", "gold-light", "gold-deco"]],
  ["الإجراء · Action", ["ember", "ember-2"]], ["الأسطح · Surfaces", ["bg", "paper", "sand", "line"]],
  ["النص · Text", ["ink", "ink-2", "muted", "muted-soft"]], ["الحالة · Status", ["success", "info", "danger", "danger-bg", "warning", "warning-bg"]]]

// fonts were verified installed in batch 1's first run; listAvailableFontsAsync takes over a minute, so loadFontAsync below is the check
const FONTS = [...new Set(TYPE.map(t => t[1] + "|" + t[2]))].map(s => ({ family: s.split("|")[0], style: s.split("|")[1] }))
await fonts(...FONTS, { family: "Inter", style: "Regular" })

print('step: inputs ok')
// ---- 1. pages --------------------------------------------------------------
const PAGES = ["00 Cover", "01 Foundations", "02 Components", "10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen", "90 Flows", "99 LTR Rules", "🗄 Archive"]
const p1 = figma.root.children.find(p => p.name === "Page 1")
if (p1 && p1.children.length === 0 && !figma.root.children.some(p => p.name === "00 Cover")) p1.name = "00 Cover"
PAGES.forEach(page)

print('step: pages ok')
// ---- 2. variables ----------------------------------------------------------
async function setVar(c, name, type, value, scopes) {
  const v = await variable(c, name, type, value)
  for (const m of c.modes.slice(1)) v.setValueForMode(m.modeId, value) // dark mode reserved: same values for now
  if (scopes) v.scopes = scopes
  return v
}
const cColor = await collection("Color", ["light"]) // shortcut: Figma Free allows 1 mode only, add "dark" when the plan is upgraded
const cSpace = await collection("Spacing", ["default"])
const cRadius = await collection("Radius", ["default"])
const cType = await collection("Type", ["default"])
const V = {}
for (const [k, o] of Object.entries(T.color)) if (!Array.isArray(o.value)) V[k] = await setVar(cColor, "color/" + k, "COLOR", rgb(o.value))
const SP = {}, RD = {}, FS = {}
for (const n of T.spacing.scale) SP[n] = await setVar(cSpace, "space/" + n, "FLOAT", n, ["GAP", "WIDTH_HEIGHT"])
for (const [k, n] of Object.entries(T.radius)) RD[k] = await setVar(cRadius, "radius/" + k, "FLOAT", n, ["CORNER_RADIUS"])
for (const t of TYPE) FS[t[3]] = await setVar(cType, "font-size/" + t[3], "FLOAT", t[4], ["FONT_SIZE"])

print('step: variables ok')
// ---- 3. styles -------------------------------------------------------------
const textStyles = await figma.getLocalTextStylesAsync()
const S = {}
for (const [name, family, style, key, size, lh] of TYPE) {
  const s = textStyles.find(x => x.name === name) || figma.createTextStyle()
  s.name = name
  s.fontName = { family, style }
  s.fontSize = size
  s.lineHeight = { unit: "PERCENT", value: lh }
  s.setBoundVariable("fontSize", FS[key])
  S[name] = s
}
const shadow = (await figma.getLocalEffectStylesAsync()).find(x => x.name === "Shadow/Card") || figma.createEffectStyle()
shadow.name = "Shadow/Card" // tokens.json: 0 1 2 rgba(42,18,21,.06), 0 8 24 -12 rgba(42,18,21,.18)
const ink = rgb(T.color.ink.value)
shadow.effects = [
  { type: "DROP_SHADOW", color: { ...ink, a: 0.06 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: "NORMAL" },
  { type: "DROP_SHADOW", color: { ...ink, a: 0.18 }, offset: { x: 0, y: 8 }, radius: 24, spread: -12, visible: true, blendMode: "NORMAL" },
]
const goldGrad = (await figma.getLocalPaintStylesAsync()).find(x => x.name === "Brand/Gold gradient") || figma.createPaintStyle()
goldGrad.name = "Brand/Gold gradient" // logo / emblem only
goldGrad.paints = [{ type: "GRADIENT_LINEAR", gradientTransform: [[0.8, 0.6, 0], [-0.6, 0.8, 0.3]],
  gradientStops: T.color["gold-gradient"].value.map((h, i, a) => ({ position: i / (a.length - 1), color: { ...rgb(h), a: 1 } })) }]

print('step: styles ok')
// ---- 4. Foundations page ---------------------------------------------------
const FP = page("01 Foundations")
await figma.setCurrentPageAsync(FP)

async function text(str, style, colorKey = "ink", align = "RIGHT") {
  const t = figma.createText()
  t.fontName = { family: S[style].fontName.family, style: S[style].fontName.style }
  t.characters = str
  await t.setTextStyleIdAsync(S[style].id)
  t.fills = [boundFill(V[colorKey])]
  t.textAlignHorizontal = align
  t.textAutoResize = "HEIGHT"
  return t
}
function radius(n, r) { for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) n.setBoundVariable(k, RD[r]) }
function box(name, dir, gap, pad, fillKey) {
  const f = stack(name, dir, 0, 0)
  f.setBoundVariable("itemSpacing", SP[gap])
  if (SP[pad]) for (const k of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"]) f.setBoundVariable(k, SP[pad])
  if (fillKey) f.fills = [boundFill(V[fillKey])]
  return f
}
function card(name, w) {
  const c = box(name, "VERTICAL", 8, 12, "paper")
  c.resize(w, 100); c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED"
  c.strokes = [boundFill(V.line)]; c.strokeWeight = 1; radius(c, "md")
  return c
}
function wrap(name, gap) {
  const r = stack(name, "HORIZONTAL", 0, 0)
  r.layoutWrap = "WRAP"; r.setBoundVariable("itemSpacing", SP[gap]); r.setBoundVariable("counterAxisSpacing", SP[gap])
  return r
}
// FILL only works once the node sits inside an auto-layout parent
function add(p, n, f = true) { p.appendChild(n); if (f) n.layoutSizingHorizontal = "FILL"; return n }

let cursorY = 0
async function section(id, title, build) {
  print('section: ' + title)
  const s = upsert(FP, id, () => figma.createSection())
  s.name = title
  s.children.slice().forEach(c => c.remove())
  const body = box(id, "VERTICAL", 32, 40, "bg")
  body.resize(1200, 100); body.primaryAxisSizingMode = "AUTO"; body.counterAxisSizingMode = "FIXED"
  s.appendChild(body); body.x = 40; body.y = 40
  add(body, await text(title, "Display/L"))
  await build(body)
  s.resizeWithoutConstraints(body.width + 80, body.height + 80)
  s.x = 0; s.y = cursorY
  cursorY += s.height + 200
}

// 4.1 colors
await section("sec-colors", "الألوان · Colors", async body => {
  for (const [label, keys] of GROUPS) {
    add(body, await text(label, "Heading/H3"))
    const row = wrap("row", 16); add(body, row)
    for (const k of keys) {
      const c = card("color/" + k, 232)
      const sw = figma.createRectangle(); sw.name = "swatch"; sw.resize(208, 88); sw.fills = [boundFill(V[k])]; radius(sw, "sm")
      sw.strokes = [boundFill(V.line)]; sw.strokeWeight = 1
      c.appendChild(sw)
      add(c, await text(AR[k], "Label/M"))
      add(c, await text(`color/${k}  ${T.color[k].value}`, "Caption", "ink-2"))
      add(c, await text(T.color[k].use, "Caption", "muted", "LEFT"))
      row.appendChild(c)
    }
    if (label.startsWith("الذهبي")) {
      const c = card("gradient/gold", 232)
      const sw = figma.createRectangle(); sw.name = "swatch"; sw.resize(208, 88); await sw.setFillStyleIdAsync(goldGrad.id); radius(sw, "sm")
      c.appendChild(sw)
      add(c, await text("تدرّج ذهبي", "Label/M"))
      add(c, await text("Brand/Gold gradient", "Caption", "ink-2"))
      add(c, await text("logo / emblem only, never body UI", "Caption", "muted", "LEFT"))
      row.appendChild(c)
    }
  }
})

// 4.2 typography
await section("sec-type", "الخطوط · Typography", async body => {
  add(body, await text("Readex Pro للواجهة (عربي + لاتيني) · El Messiri للعناوين والأرقام الكبيرة", "Body/L", "ink-2"))
  for (const [name, family, style, , size, lh] of TYPE) {
    const c = card(name, 1120)
    add(c, await text("جزلة — لحوم ومواشي طازجة من أفضل المتاجر", name))
    add(c, await text("Jazlah — fresh meat & livestock · 1234567890", name, "ink", "LEFT"))
    add(c, await text(`${name} · ${family} ${style} · ${size}/${lh}%`, "Caption", "muted", "LEFT"))
    body.appendChild(c)
  }
})

// 4.3 spacing & radius
await section("sec-space", "المسافات والزوايا · Spacing & Radius", async body => {
  add(body, await text("المسافات (أساس 4) · Spacing", "Heading/H3"))
  const sp = box("spacing", "VERTICAL", 8, 0); add(body, sp)
  for (const n of T.spacing.scale) {
    const r = stack("space/" + n, "HORIZONTAL", 0, 0); r.counterAxisAlignItems = "CENTER"; r.setBoundVariable("itemSpacing", SP[16]); r.primaryAxisSizingMode = "FIXED"; r.primaryAxisAlignItems = "MAX"
    const bar = figma.createRectangle(); bar.name = "bar"; bar.resize(n, 16); bar.setBoundVariable("width", SP[n]); bar.fills = [boundFill(V.ember)]
    r.appendChild(await text(`space/${n} = ${n}`, "Caption", "ink-2", "RIGHT")); r.appendChild(bar); add(sp, r)
  }
  add(body, await text("الزوايا · Radius", "Heading/H3"))
  const rr = wrap("radius", 24); add(body, rr)
  for (const [k, n] of Object.entries(T.radius)) {
    const c = card("radius/" + k, 160)
    const sq = figma.createRectangle(); sq.name = "sample"; sq.resize(136, 88); sq.fills = [boundFill(V.sand)]; radius(sq, k)
    sq.strokes = [boundFill(V.line)]; sq.strokeWeight = 1
    c.appendChild(sq); add(c, await text(`radius/${k} = ${n}`, "Caption", "ink-2", "LEFT")); rr.appendChild(c)
  }
})

// 4.4 elevation
await section("sec-elev", "الظلال · Elevation", async body => {
  const c = card("Shadow/Card", 320)
  add(c, await text("ظل البطاقة", "Label/M"))
  add(c, await text("Shadow/Card · 0 1 2 / 0 8 24 -12", "Caption", "ink-2", "LEFT"))
  await c.setEffectStyleIdAsync(shadow.id)
  body.appendChild(c)
})

// 4.5 contrast (WCAG AA), computed from tokens.json
const lum = h => { const c = rgb(h); const f = x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
const ratio = (a, b) => { const [x, y] = [lum(T.color[a].value), lum(T.color[b].value)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const PAIRS = [["ink", "bg"], ["ink", "paper"], ["ink-2", "bg"], ["muted", "bg"], ["muted", "paper"], ["paper", "brand"], ["paper", "ember"], ["paper", "ember-2"],
  ["gold-text", "bg"], ["gold-text", "paper"], ["gold", "brand"], ["gold-light", "brand"], ["success", "paper"], ["info", "paper"], ["ember", "bg"],
  ["danger", "bg"], ["danger", "paper"], ["danger", "danger-bg"], ["paper", "danger"], ["warning", "bg"], ["warning", "paper"], ["warning", "warning-bg"], ["paper", "warning"],
  ["muted-soft", "bg"], ["gold-deco", "bg"], ["gold", "bg"]] // last three: large text / decoration only
const report = []
await section("sec-contrast", "التباين · Contrast (WCAG AA)", async body => {
  add(body, await text("النص العادي يحتاج 4.5:1، والنص الكبير (18 فأكثر أو 14 سميك) يحتاج 3:1", "Body/M", "ink-2"))
  const grid = wrap("pairs", 16); add(body, grid)
  for (const [fg, bg] of PAIRS) {
    const r = ratio(fg, bg), ok = r >= 4.5, large = r >= 3
    report.push(`${fg} على ${bg}: ${r.toFixed(2)} ${ok ? "✅ AA" : large ? "⚠️ كبير فقط" : "❌"}`)
    const c = card(`${fg}/${bg}`, 360)
    const demo = box("demo", "HORIZONTAL", 8, 16, bg); radius(demo, "sm")
    demo.strokes = [boundFill(V.line)]; demo.strokeWeight = 1
    add(demo, await text("أبجد Aa — لحم طازج", "Body/L", fg))
    add(c, demo)
    add(c, await text(`${fg} على ${bg}`, "Label/M"))
    add(c, await text(`${r.toFixed(2)}:1 · ${ok ? "AA ✓ نص عادي" : large ? "AA نص كبير فقط" : "لا يجتاز AA"}`, "Caption", ok ? "success" : "ember"))
    grid.appendChild(c)
  }
})

figma.viewport.scrollAndZoomIntoView(FP.children)
print(["✅ batch 1 done", `pages: ${figma.root.children.length}`, `variables: ${Object.keys(V).length} colors, ${Object.keys(SP).length} spacing, ${Object.keys(RD).length} radius, ${Object.keys(FS).length} font sizes`,
  `styles: ${TYPE.length} text, 1 effect, 1 paint`, "", "contrast:", ...report].join("\n"))
