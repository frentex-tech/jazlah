// Jazlah Figma helpers (plain JS, Figma Plugin API). Loaded before every script by the loader in design/figma/README.md.
const NS = "jazlah"

// Find a page by name or create it.
function page(name) {
  return figma.root.children.find(p => p.name === name) || (() => { const p = figma.createPage(); p.name = name; return p })()
}

// Call once before searching across pages (files use dynamic page loading).
async function ready() { await figma.loadAllPagesAsync() }

// Find a node with a stable id (shared plugin data) inside a parent, or create it with make().
function upsert(parent, id, make) {
  const found = parent.findOne(n => n.getSharedPluginData(NS, "id") === id)
  if (found) return found
  const node = make()
  node.setSharedPluginData(NS, "id", id)
  parent.appendChild(node)
  return node
}

// Load fonts before editing text.
async function fonts(...list) { for (const f of list) await figma.loadFontAsync(f) }

// Auto-layout frame.
function stack(name, dir, gap = 8, pad = 0) {
  const f = figma.createFrame()
  f.name = name
  f.layoutMode = dir
  f.itemSpacing = gap
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = pad
  f.primaryAxisSizingMode = "AUTO"
  f.counterAxisSizingMode = "AUTO"
  f.fills = []
  return f
}

// Get or create a variable collection with the given modes.
async function collection(name, modes = ["light"]) {
  const c = (await figma.variables.getLocalVariableCollectionsAsync()).find(v => v.name === name)
    || figma.variables.createVariableCollection(name)
  c.renameMode(c.modes[0].modeId, modes[0])
  for (const m of modes.slice(1)) if (!c.modes.find(x => x.name === m)) c.addMode(m)
  return c
}

// Get or create a variable and set its value for the collection's first mode.
async function variable(c, name, type, value) {
  const v = (await figma.variables.getLocalVariablesAsync(type)).find(x => x.name === name && x.variableCollectionId === c.id)
    || figma.variables.createVariable(name, c, type)
  v.setValueForMode(c.modes[0].modeId, value)
  return v
}

// "#RRGGBB" -> Figma RGB.
function rgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

// Solid paint bound to a color variable.
function boundFill(v) {
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v)
}

// Move a node to the Archive page instead of deleting it.
function archive(node) { page("🗄 Archive").appendChild(node) }
