// Design-system builders shared by the DSN-DES-1 batches (loaded after _lib.js).
// Only function declarations and the single `DS` var live at top level, so batch scripts can declare their own consts.
var DS = null

// Read variables, styles and tokens that batch 01 created in this file.
async function loadDS() {
  await page("02 Components").loadAsync() // inst() looks components up here; loadAllPagesAsync is too slow
  const T = await (await fetch(B.replace("design/figma/scripts/", "docs/design/tokens.json"))).json()
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
  const vars = await figma.variables.getLocalVariablesAsync()
  const by = n => {
    const c = cols.find(x => x.name === n)
    return Object.fromEntries(vars.filter(v => v.variableCollectionId === c.id).map(v => [v.name.split("/").slice(1).join("/"), v]))
  }
  const S = Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s => [s.name, s]))
  const shadow = (await figma.getLocalEffectStylesAsync()).find(x => x.name === "Shadow/Card")
  DS = { T, V: by("Color"), SP: by("Spacing"), RD: by("Radius"), S, shadow, pairs: [], sets: {} }
  await fonts(...["Regular", "Medium", "SemiBold"].map(style => ({ family: "Readex Pro", style })), { family: "El Messiri", style: "Bold" })
  return DS
}

function paint(key, alpha) {
  const p = figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", DS.V[key])
  return alpha == null ? p : { ...p, opacity: alpha }
}

// bind a number to a Spacing variable when it is on the scale, else set it raw
function bind(node, field, n) {
  const v = DS.SP[n]
  if (v && n > 0) node.setBoundVariable(field, v); else node[field] = n
}

function setRadius(node, r) {
  if (r == null) return
  const key = typeof r === "string" ? r : null
  for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
    if (key) node.setBoundVariable(k, DS.RD[key]); else node[k] = r
  }
}

// Auto-layout frame (or component with o.comp). Horizontal frames are RTL: list children in logical order
// (first = right-most); add() mirrors them. o: dir w h gap pad px py fill stroke sw r main cross ltr comp clip
function frame(name, o = {}) {
  const f = o.comp ? figma.createComponent() : figma.createFrame()
  f.name = name
  f.fills = o.fill ? [paint(o.fill, o.alpha)] : []
  f.layoutMode = o.dir || "VERTICAL"
  const H = f.layoutMode === "HORIZONTAL"
  const rtl = H && !o.ltr
  if (rtl) f.setSharedPluginData(NS, "rtl", "1")
  f.resize(o.w != null ? o.w : f.width, o.h != null ? o.h : f.height)
  f.primaryAxisSizingMode = (H ? o.w != null : o.h != null) ? "FIXED" : "AUTO"
  f.counterAxisSizingMode = (H ? o.h != null : o.w != null) ? "FIXED" : "AUTO"
  bind(f, "itemSpacing", o.gap || 0)
  const px = o.px != null ? o.px : o.pad || 0, py = o.py != null ? o.py : o.pad || 0
  bind(f, "paddingLeft", px); bind(f, "paddingRight", px); bind(f, "paddingTop", py); bind(f, "paddingBottom", py)
  const flip = { MIN: "MAX", MAX: "MIN" }
  f.primaryAxisAlignItems = rtl && flip[o.main] ? flip[o.main] : o.main || "MIN"
  f.counterAxisAlignItems = o.cross || "MIN"
  setRadius(f, o.r)
  if (o.stroke) { f.strokes = [paint(o.stroke)]; f.strokeWeight = o.sw || 1; f.strokeAlign = "INSIDE" }
  if (o.clip) f.clipsContent = true
  return f
}

// Append (mirrored inside RTL rows). fill: "h" | "v" | "hv" stretches the child inside an auto-layout parent.
function add(parent, child, fill) {
  if (parent.getSharedPluginData(NS, "rtl") === "1") parent.insertChild(0, child); else parent.appendChild(child)
  if (fill && fill.includes("h")) child.layoutSizingHorizontal = "FILL"
  if (fill && fill.includes("v")) child.layoutSizingVertical = "FILL"
  return child
}

// Text with a text style and a color variable. o: align (default RIGHT), w (fixed width), name
async function txt(str, style = "Body/M", color = "ink", o = {}) {
  const t = figma.createText()
  t.fontName = DS.S[style].fontName
  t.characters = String(str)
  await t.setTextStyleIdAsync(DS.S[style].id)
  t.fills = [paint(color)]
  t.textAlignHorizontal = o.align || "RIGHT"
  t.name = o.name || String(str).slice(0, 28)
  if (o.w) { t.resize(o.w, t.height); t.textAutoResize = "HEIGHT" }
  return t
}

// link a node to the Shadow/Card effect style
async function shade(node) { await node.setEffectStyleIdAsync(DS.shadow.id); return node }

function rect(name, w, h, fillKey, r, o = {}) {
  const x = figma.createRectangle()
  x.name = name; x.resize(w, h)
  x.fills = fillKey ? [paint(fillKey, o.alpha)] : []
  setRadius(x, r)
  if (o.stroke) { x.strokes = [paint(o.stroke)]; x.strokeWeight = o.sw || 1; x.strokeAlign = "INSIDE" }
  return x
}
function circle(name, d, fillKey, o = {}) {
  const x = figma.createEllipse()
  x.name = name; x.resize(d, d)
  x.fills = fillKey ? [paint(fillKey, o.alpha)] : []
  if (o.stroke) { x.strokes = [paint(o.stroke)]; x.strokeWeight = o.sw || 1; x.strokeAlign = "INSIDE" }
  return x
}

// ---- contrast registry -------------------------------------------------------
const _lin = h => { const c = rgb(h); const f = x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
// bg is a color key, or [key, alpha, baseKey] for a tint over base
function chk(where, fg, bg, min = 4.5) {
  const hex = k => DS.T.color[k].value
  const mix = (a, b, al) => { const x = rgb(a), y = rgb(b); const m = (p, q) => Math.round((p * al + q * (1 - al)) * 255).toString(16).padStart(2, "0"); return "#" + m(x.r, y.r) + m(x.g, y.g) + m(x.b, y.b) }
  const bgHex = Array.isArray(bg) ? mix(hex(bg[0]), hex(bg[2]), bg[1]) : hex(bg)
  const a = _lin(hex(fg)), b = _lin(bgHex)
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  DS.pairs.push({ where, fg, bg: Array.isArray(bg) ? bg.join("/") : bg, ratio, min, ok: ratio >= min })
  return ratio >= min
}
function contrastReport() {
  const bad = DS.pairs.filter(p => !p.ok)
  return [`contrast checks: ${DS.pairs.length}, failing: ${bad.length}`, ...DS.pairs.map(p => `${p.ok ? "✅" : "❌"} ${p.ratio.toFixed(2)} (min ${p.min})  ${p.where}: ${p.fg} on ${p.bg}`)].join("\n")
}

// ---- sections and components ---------------------------------------------------
// One Section per feature on a page, stacked with 200 between them. build(body) fills a cream frame.
// Skips the rebuild (returns null) when a component inside is used by instances elsewhere.
async function sectionOn(ctx, pageName, id, title, build, width = 1280) {
  const pg = page(pageName)
  await figma.setCurrentPageAsync(pg)
  let s = pg.children.find(n => n.type === "SECTION" && n.getSharedPluginData(NS, "id") === id)
  if (s) {
    const pageOf = n => { while (n && n.type !== "PAGE") n = n.parent; return n }
    for (const c of s.findAll(n => n.type === "COMPONENT")) {
      // instances on this same page are sibling components, rebuilt together; instances elsewhere are real screens
      if ((await c.getInstancesAsync()).some(i => pageOf(i) !== pg)) { print(`⚠️ ${title}: components are in use, kept as is`); ctx.y = Math.max(ctx.y, s.y + s.height + 200); return null }
    }
    s.children.slice().forEach(c => c.remove())
  } else { s = figma.createSection(); s.setSharedPluginData(NS, "id", id); pg.appendChild(s) }
  s.name = title
  const body = frame(id, { gap: 32, pad: 40, w: width, fill: "bg" })
  s.appendChild(body); body.x = 40; body.y = 40
  add(body, await txt(title, "Display/L"), "h")
  await build(body)
  s.resizeWithoutConstraints(body.width + 80, body.height + 80)
  s.x = 0; s.y = ctx.y
  ctx.y += s.height + 200
  return s
}

const _name = p => Object.entries(p).map(([k, v]) => `${k}=${v}`).join(", ")
function _combos(def) {
  return Object.entries(def).reduce((acc, [k, vals]) => acc.flatMap(a => vals.map(v => ({ ...a, [k]: v }))), [{}])
}

// Component set from a property matrix. mk(props) returns a component (frame(..., {comp:true})).
// textProps: names of text nodes ("label", ...) exposed as TEXT component properties.
async function defineSet(host, id, name, def, mk, textProps = [], width = 1200) {
  const comps = []
  for (const p of _combos(def)) { const c = await mk(p); c.name = _name(p); comps.push(c) }
  const set = figma.combineAsVariants(comps, host)
  set.name = name; set.setSharedPluginData(NS, "id", id)
  set.layoutMode = "HORIZONTAL"; set.layoutWrap = "WRAP"
  set.resize(width, 100) // resize() makes both axes FIXED, so set the sizing modes after it
  set.primaryAxisSizingMode = "FIXED"; set.counterAxisSizingMode = "AUTO"
  set.itemSpacing = 24; set.counterAxisSpacing = 24
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 24
  for (const t of textProps) {
    try {
      const first = comps[0].findOne(n => n.type === "TEXT" && n.name === t)
      const key = set.addComponentProperty(t, "TEXT", first ? first.characters : t)
      for (const c of comps) { const n = c.findOne(x => x.type === "TEXT" && x.name === t); if (n) n.componentPropertyReferences = { characters: key } }
    } catch (e) { print(`⚠️ text property ${t} on ${name}: ${e.message}`) }
  }
  return set
}
function defineOne(host, id, name, comp) {
  comp.name = name; comp.setSharedPluginData(NS, "id", id); host.appendChild(comp); return comp
}

// Instance of a component or variant by id and props.
function inst(id, props = {}) {
  const key = "c:" + id
  let n = DS.sets[key]
  if (!n) n = DS.sets[key] = page("02 Components").findOne(x => (x.type === "COMPONENT_SET" || x.type === "COMPONENT") && x.getSharedPluginData(NS, "id") === id)
  if (!n) throw new Error("component not found: " + id)
  if (n.type === "COMPONENT") return n.createInstance()
  const v = n.children.find(c => c.name === _name(props)) || n.defaultVariant
  return v.createInstance()
}
function setProp(i, key, val) {
  const k = Object.keys(i.componentProperties).find(x => x.startsWith(key + "#"))
  if (k) i.setProperties({ [k]: val })
}
