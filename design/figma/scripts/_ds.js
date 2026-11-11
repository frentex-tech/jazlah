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
  // RTL: children of a vertical stack hug the right edge unless the caller says otherwise
  f.counterAxisAlignItems = o.cross || (!H && !o.ltr ? "MAX" : "MIN")
  if (o.ltr) f.setSharedPluginData(NS, "ltr", "1")
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
// compact report: totals, every failure, and the 6 lowest passing ratios
function contrastReport() {
  const bad = DS.pairs.filter(p => !p.ok), low = DS.pairs.filter(p => p.ok).sort((a, b) => a.ratio - b.ratio).slice(0, 6)
  const line = p => `${p.ok ? "OK" : "FAIL"} ${p.ratio.toFixed(2)} (min ${p.min}) ${p.where}: ${p.fg} on ${p.bg}`
  return [`contrast checks: ${DS.pairs.length}, failing: ${bad.length}`, ...bad.map(line), "lowest passing:", ...low.map(line)].join("\n")
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
  ;(ctx.ids = ctx.ids || []).push(s.id + " " + title)
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

// ---- Phosphor icons (regular; weight "fill" for the active state) -----------------
// Fetched from the Phosphor core repo at run time, colored through a Color variable. Directional icons: in RTL, "forward" is caret-left.
var _svgCache = {}
async function icon(name, size = 24, color = "ink", weight = "regular") {
  const file = weight === "fill" ? name + "-fill" : name
  const url = "https://raw.githubusercontent.com/phosphor-icons/core/main/assets/" + weight + "/" + file + ".svg"
  if (!_svgCache[url]) { const r = await fetch(url); if (!r.ok) throw new Error("icon " + name + " " + r.status); _svgCache[url] = await r.text() }
  const n = figma.createNodeFromSvg(_svgCache[url])
  n.name = "ph/" + name + (weight === "fill" ? "-fill" : "")
  n.resize(size, size)
  for (const v of n.findAll(x => "fills" in x && x.type !== "FRAME")) v.fills = [paint(color)]
  n.fills = []
  n.clipsContent = false
  return n
}

// ================================================================================================
// Screen templates and helpers (used by every screen batch). All screens are Arabic RTL, built from components only.
// Frame names follow <Area>/<Feature>/<Screen> — <State>. Mobile 390x844, web 1440.
// ================================================================================================

// Replace the text of the first TEXT node inside `node` whose characters equal `from` (component copy override).
async function retext(node, from, to) {
  const t = node.findOne(n => n.type === "TEXT" && n.characters === from)
  if (!t) { print("⚠️ retext: no text '" + from + "' in " + node.name); return null }
  await figma.loadFontAsync(t.fontName)
  t.characters = String(to)
  return t
}
// Replace every text in `node` that equals `from` (e.g. repeated row labels).
async function retextAll(node, from, to) {
  for (const t of node.findAll(n => n.type === "TEXT" && n.characters === from)) { await figma.loadFontAsync(t.fontName); t.characters = String(to) }
}

// An Input instance with its label, value (or placeholder) and hint set. state: default|focused|filled|error|disabled
async function field(label, value, state = "default", hint) {
  const i = inst("input", { state })
  await retext(i, "الاسم الكامل", label)
  if (value != null) await retext(i, state === "filled" || state === "error" ? "عبدالرحمن محمد" : "اكتب هنا", value)
  if (hint != null) await retext(i, state === "error" ? "هذا الحقل مطلوب" : "نص مساعد", hint)
  return i
}
// A Button instance (variant primary|secondary|ghost|danger, state default|pressed|disabled|loading, size L|S).
async function button(label, variant = "primary", state = "default", size = "L") {
  const b = inst("button", { variant, state, size }); await retext(b, "اطلب الآن", label); return b
}
// A Chip instance (state default|selected|disabled)
async function chip(label, state = "default") { const c = inst("chip", { state }); await retext(c, "خروف نعيمي", label); return c }

function statusBarRow(dark) {
  const r = frame("status bar", { dir: "HORIZONTAL", ltr: true, w: 390, h: 44, px: 24, main: "SPACE_BETWEEN", cross: "CENTER" })
  return r
}
async function statusBar(color = "ink") {
  const r = statusBarRow()
  r.appendChild(await txt("9:41", "Label/M", color, { align: "LEFT" }))
  const ic = frame("system icons", { dir: "HORIZONTAL", ltr: true, gap: 6, cross: "CENTER" })
  for (const n of ["cell-signal-full", "wifi-high", "battery-full"]) ic.appendChild(await icon(n, 16, color, "fill"))
  r.appendChild(ic)
  return r
}

// Mobile screen shell: status bar, optional header (home|page), scrolling body, optional bottom tab bar.
// o: path ("Account/Login/Phone"), state ("Default"), header {type, title, cart} | null, tab "1".."4" | null, bg ("bg"), pad (16), gap (16)
// Returns { screen, body }. Put content into `body` with add(body, node, "h").
async function mobileScreen(o) {
  const screen = frame(`App/${o.path} — ${o.state || "Default"}`, { w: 390, h: 844, fill: o.bg || "bg", stroke: "line", r: "lg", clip: true, cross: "MIN" })
  screen.setSharedPluginData(NS, "screen", o.path)
  add(screen, await statusBar(), "h")
  if (o.header) {
    const h = inst("app-header", { type: o.header.type || "page", cart: o.header.cart || "empty" })
    add(screen, h, "h"); if (o.header.title) await retext(h, "عنوان الصفحة", o.header.title)
  }
  const body = frame("body", { w: 390, pad: o.pad == null ? 16 : o.pad, gap: o.gap == null ? 16 : o.gap, clip: true })
  add(screen, body, "h"); body.layoutSizingVertical = "FILL"
  if (o.tab) add(screen, inst("bottom-tab-bar", { active: o.tab }), "h")
  return { screen, body }
}

// Web screen shell (1440): top nav (wordmark, links, search, cart), centered 1200 content column, footer.
// o: path, state, nav (true) , active (index of the active link 0..3). Returns { screen, body } where body is 1200 wide.
async function webScreen(o) {
  const screen = frame(`Web/${o.path} — ${o.state || "Default"}`, { w: 1440, fill: "bg", stroke: "line", clip: true, cross: "CENTER" })
  screen.setSharedPluginData(NS, "screen", o.path)
  if (o.nav !== false) {
    const nav = frame("nav", { dir: "HORIZONTAL", w: 1440, h: 72, px: 120, gap: 32, cross: "CENTER", fill: "paper", stroke: "line", main: "SPACE_BETWEEN" })
    add(nav, await txt("جزلة", "Display/L", "brand", { name: "wordmark" }))
    const links = frame("links", { dir: "HORIZONTAL", gap: 24 })
    for (const [i, t] of ["الرئيسية", "المتاجر", "الخدمات", "حسابي"].entries()) add(links, await txt(t, "Label/M", i === (o.active == null ? 0 : o.active) ? "ember" : "ink-2"))
    add(nav, links)
    const s = frame("search", { dir: "HORIZONTAL", w: 360, h: 44, px: 16, gap: 8, cross: "CENTER", fill: "bg", stroke: "line", r: "pill" })
    add(s, await icon("magnifying-glass", 20, "ink-2")); add(s, await txt("ابحث عن لحوم أو متاجر", "Body/M", "muted"), "h"); add(nav, s)
    const cart = frame("cart", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
    add(cart, await icon("shopping-bag", 24, "ink")); add(cart, await icon("bell", 24, "ink")); add(nav, cart)
    add(screen, nav, "h")
    chk("web nav link", "ink-2", "paper"); chk("web nav active", "ember", "paper"); chk("web nav wordmark", "brand", "paper"); chk("web nav search", "muted", "bg")
  }
  const body = frame("body", { w: 1200, py: 40, gap: 24, cross: "MAX" })
  add(screen, body)
  if (o.footer !== false) {
    const f = frame("footer", { dir: "HORIZONTAL", w: 1440, h: 120, px: 120, cross: "CENTER", main: "SPACE_BETWEEN", fill: "brand-deep" })
    add(f, await txt("جزلة", "Display/L", "gold-light")); add(f, await txt("منصة اللحوم والمواشي في المملكة العربية السعودية", "Body/M", "sand"))
    add(screen, f, "h"); chk("web footer", "sand", "brand-deep")
  }
  return { screen, body }
}

// Copy a screen as another state: the clone keeps status bar, header and tab bar; `body` is emptied for you to refill.
// Returns { screen, body } named "<path> — <state>". Use retext(clone.screen, ...) to change header text etc.
function stateCopy(base, state, keepBody = false) {
  const c = base.screen.clone()
  const path = base.screen.getSharedPluginData(NS, "screen")
  c.name = base.screen.name.replace(/ — .*$/, "") + " — " + state
  const body = c.findOne(n => n.name === "body" && n.type === "FRAME")
  if (!keepBody) body.children.slice().forEach(k => k.remove())
  return { screen: c, body }
}

// A heading + helper paragraph block for forms and empty content
async function titleBlock(title, sub, align = "RIGHT", w = 358) {
  const f = frame("title block", { gap: 8, w })
  add(f, await txt(title, "Heading/H1", "ink", { w, align }), "h")
  if (sub) add(f, await txt(sub, "Body/M", "ink-2", { w, align }), "h")
  return f
}
async function skeletonRows(n = 4) { const f = frame("loading", { gap: 12, w: 358 }); for (let i = 0; i < n; i++) add(f, inst("skeleton-row"), "h"); return f }
function spacer() { const s = frame("spacer", {}); return s }

// Lay out a feature section: title, then a row of main screens in flow order (left to right), then a row of their states. Gap 80.
// Screens are placed directly inside the Figma Section (not in auto-layout frames) because prototype flow starting points must be top-level.
// build receives S = { main: [], states: [] } of screen frames. Rebuilds the section in place when it exists.
async function screenSection(ctx, pageName, id, title, build) {
  const pg = page(pageName)
  await figma.setCurrentPageAsync(pg)
  let s = pg.children.find(n => n.type === "SECTION" && n.getSharedPluginData(NS, "id") === id)
  if (s) s.children.slice().forEach(c => c.remove()); else { s = figma.createSection(); s.setSharedPluginData(NS, "id", id); pg.appendChild(s) }
  s.name = title; s.fills = [{ type: "SOLID", color: rgb(DS.T.color.bg.value) }] // variable-bound paints render black on Sections
  const S = { main: [], states: [] }
  await build(S)
  const M = 40, GAP = 80
  const t = await txt(title, "Heading/H1"); s.appendChild(t); t.x = M; t.y = M
  let y = M + 120, maxW = t.width + 2 * M
  if (S.note) { // design annotation: lives outside the screens, under the section title
    const nt = await txt(S.note, "Body/M", "ink-2", { w: 900, align: "RIGHT" }); s.appendChild(nt); nt.x = M; nt.y = M + 64; y += 56; maxW = Math.max(maxW, 900 + 2 * M)
  }
  const row = nodes => { let x = M, h = 0; for (const n of nodes) { s.appendChild(n); n.x = x; n.y = y; x += n.width + GAP; h = Math.max(h, n.height) } maxW = Math.max(maxW, x - GAP + M); y += h }
  row(S.main)
  if (S.states.length) {
    y += 64; const c = await txt("الحالات · States", "Heading/H3"); s.appendChild(c); c.x = M; c.y = y; y += 80
    row(S.states)
  }
  s.resizeWithoutConstraints(maxW, y + M)
  s.x = 0; s.y = ctx.y
  ;(ctx.ids = ctx.ids || []).push(s.id + " " + title)
  ctx.y += s.height + 200
  return s
}

// Prototype: tapping `from` (any node, usually a Button instance) navigates to the `to` screen frame.
async function tap(from, to) {
  await from.setReactionsAsync([{ trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId: to.id, navigation: "NAVIGATE", transition: null, preserveScrollPosition: false }] }])
}
// Register a named flow starting point on the page that holds `screen`.
function flowStart(pageName, screen, name) {
  const pg = page(pageName), m = new Map()
  for (const f of pg.flowStartingPoints) if (f.name !== name && f.nodeId !== screen.id && figma.getNodeById(f.nodeId)) m.set(f.nodeId, f)
  m.set(screen.id, { nodeId: screen.id, name })
  pg.flowStartingPoints = [...m.values()]
}
// First Button instance in `screen` whose label text equals `label`
function findButton(screen, label) {
  return screen.findOne(n => n.type === "INSTANCE" && n.name === "Button" && n.findOne(t => t.type === "TEXT" && t.characters === label)) || screen.findOne(n => n.type === "TEXT" && n.characters === label)
}

// Instances cannot gain or lose children. To fill a slot (bottom sheet content, card body, state panel...), detach the instance
// (it becomes a plain frame that looks identical) and replace the children of the named slot frame.
async function slot(i, slotName, build) {
  const f = i.type === "INSTANCE" ? i.detachInstance() : i
  const s = f.findOne(n => n.name === slotName)
  if (!s) throw new Error("slot not found: " + slotName + " in " + f.name)
  s.children.slice().forEach(k => k.remove())
  await build(s)
  return f
}

// Dashboard screen (1440): side nav on the right (RTL start), top bar, page header, content column of 1132.
// o: path ("Orders/List"), state, role (admin|vendor|kitchen), title, crumb, actions (true: primary + secondary buttons).
// Frame name is <Area>/<path> — <state> with Area = Admin | Vendor | Kitchen. Returns { screen, body }.
async function dashScreen(o) {
  const role = o.role || "admin", area = { admin: "Admin", vendor: "Vendor", kitchen: "Kitchen" }[role]
  const screen = frame(`${area}/${o.path} — ${o.state || "Default"}`, { dir: "HORIZONTAL", w: 1440, h: o.h || 1024, fill: "bg", stroke: "line", clip: true, cross: "MIN" })
  screen.setSharedPluginData(NS, "screen", o.path)
  add(screen, inst("side-nav", { role }))
  const main = frame("main", { w: 1180, gap: 0, cross: "MIN" }); add(screen, main); main.layoutSizingVertical = "FILL"
  add(main, inst("top-bar"), "h")
  const content = frame("content", { w: 1180, pad: 24, gap: 24 }); add(main, content, "h"); content.layoutSizingVertical = "FILL"
  const ph = inst("page-header"); add(content, ph, "h")
  if (o.title) await retext(ph, "الطلبات", o.title)
  if (o.crumb) await retext(ph, "الطلبات / كل الطلبات", o.crumb)
  if (o.actions === false) { const a = ph.findOne(n => n.name === "actions"); if (a) a.visible = false }
  const body = frame("body", { w: 1132, gap: 24 }); add(content, body, "h"); body.layoutSizingVertical = "FILL"
  return { screen, body }
}


// ================================================================================================
// Photos, brand emblem, auth screen template, phone value
// ================================================================================================
var _img = {}
// Reference photos live in docs/design/reference/prototype/img (jpg; marks are png). `key` is the file name without extension.
async function photoPaint(key, mode = "FILL") {
  const ext = key.startsWith("mark-") || key.startsWith("logo-") || key.startsWith("word-") ? ".png" : ".jpg"
  if (!_img[key]) {
    const r = await fetch(B.replace("design/figma/scripts/", "docs/design/reference/prototype/img/") + key + ext)
    if (!r.ok) throw new Error("photo " + key + " " + r.status)
    _img[key] = figma.createImage(new Uint8Array(await r.arrayBuffer()))
  }
  return { type: "IMAGE", imageHash: _img[key].hash, scaleMode: mode }
}
// Put a photo into a placeholder container (hides its icon). Safe on instance children.
async function setPhoto(node, key, mode = "FILL") {
  node.fills = [await photoPaint(key, mode)]
  node.findAll(n => n.name === "ph/image" || n.name === "ph/storefront").forEach(n => (n.visible = false))
}
var _emb = null
// The approved emblem (ram in shield), from docs/design/brand. h = height in px.
async function emblemNode(h = 100, file = "emblem-a-shield.svg") {
  if (!_emb) _emb = await (await fetch(B.replace("design/figma/scripts/", "docs/design/brand/") + file)).text()
  const n = figma.createNodeFromSvg(_emb); n.name = "emblem"
  const k = h / n.height; n.resize(n.width * k, h); n.clipsContent = false
  return n
}
// A phone-input instance showing a typed number (value text in ink, not placeholder color)
function phoneValue(i, value = "55 123 4567") {
  const t = i.findOne(n => n.type === "TEXT" && /^5X/.test(n.characters))
  if (!t) return i
  t.characters = value; t.fills = [paint("ink")]
  return i
}
// Auth mobile screen: brand hero (photo + brand-deep scrim + emblem + wordmark) over a form body. o: path, state, heroH, back, photo
async function authScreen(o) {
  const H = o.heroH || 300
  const screen = frame(`App/${o.path} — ${o.state || "Default"}`, { w: 390, h: 844, fill: "bg", stroke: "line", r: "lg", clip: true, cross: "MIN" })
  screen.setSharedPluginData(NS, "screen", o.path)
  const hero = frame("hero", { w: 390, h: H, clip: true, cross: "MIN" })
  hero.topLeftRadius = 0; hero.topRightRadius = 0; hero.bottomLeftRadius = 26; hero.bottomRightRadius = 26
  const ph = frame("photo", { dir: "HORIZONTAL", w: 390, h: H, fill: "sand", main: "CENTER", cross: "CENTER" })
  add(ph, await icon("image", 32, "ink-2")); ph.setSharedPluginData(NS, "photo", o.photo || "lamb-spit")
  hero.appendChild(ph); ph.layoutPositioning = "ABSOLUTE"; ph.x = 0; ph.y = 0
  const ov = rect("scrim", 390, H, "brand-deep", null, { alpha: 0.58 }); hero.appendChild(ov); ov.layoutPositioning = "ABSOLUTE"; ov.x = 0; ov.y = 0
  add(hero, await statusBar("paper"), "h")
  if (o.back) {
    const row = frame("nav", { dir: "HORIZONTAL", w: 390, px: 16, py: 4 })
    const b = frame("back", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "paper", r: "pill" })
    add(b, await icon("caret-right", 20, "ink")); add(row, b); add(hero, row, "h")
  }
  const brand = frame("brand", { w: 390, gap: 8, main: "CENTER", cross: "CENTER" })
  add(brand, await emblemNode(H > 260 ? 110 : 72)); add(brand, await txt("جزلة", H > 260 ? "Display/XL" : "Display/L", "gold-light", { align: "CENTER" }))
  add(hero, brand, "h"); brand.layoutSizingVertical = "FILL"
  chk("auth wordmark", "gold-light", "brand-deep")
  add(screen, hero, "h")
  const body = frame("body", { w: 390, pad: 24, gap: 16, clip: true })
  add(screen, body, "h"); body.layoutSizingVertical = "FILL"
  return { screen, body }
}

// Three short brand promises with icons (fills empty auth screens with identity, not placeholders)
async function trustRow(w = 342) {
  const f = frame("trust", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "MIN" })
  for (const [ic, t] of [["seal-check", "متاجر موثّقة"], ["thermometer", "طازج يوم الذبح"], ["truck", "توصيل في يومك"]]) {
    const c = frame("point", { w: 104, gap: 8, cross: "CENTER" })
    const r = frame("ring", { dir: "HORIZONTAL", w: 52, h: 52, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" })
    add(r, await icon(ic, 26, "brand")); add(c, r); add(c, await txt(t, "Label/M", "ink", { align: "CENTER", w: 104 }), "h"); f.appendChild(c)
  }
  chk("trust label", "ink", "bg"); chk("trust icon", "brand", "sand", 3)
  return f
}
