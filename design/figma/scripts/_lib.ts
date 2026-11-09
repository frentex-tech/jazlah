// Jazlah Figma helpers. Paste ABOVE any script when running it in Scripter.
// Plain Figma Plugin API only, so it works in Scripter or any plugin runtime.

const NS = "jazlah"

/** Find a page by name or create it. */
function page(name: string): PageNode {
  return figma.root.children.find(p => p.name === name) as PageNode ?? (() => {
    const p = figma.createPage(); p.name = name; return p
  })()
}

/** Call once at the top of any script that searches across pages (files use dynamic page loading). */
async function ready() { await figma.loadAllPagesAsync() }

/** Find a node with a stable id (shared plugin data) inside a parent, or create it with make(). */
function upsert<T extends SceneNode>(parent: BaseNode & ChildrenMixin, id: string, make: () => T): T {
  const found = parent.findOne(n => n.getSharedPluginData(NS, "id") === id) as T | null
  if (found) return found
  const node = make()
  node.setSharedPluginData(NS, "id", id)
  parent.appendChild(node)
  return node
}

/** Load fonts once before editing text. */
async function fonts(...list: FontName[]) {
  for (const f of list) await figma.loadFontAsync(f)
}

/** Auto-layout frame. */
function stack(name: string, dir: "VERTICAL" | "HORIZONTAL", gap = 8, pad = 0): FrameNode {
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

/** Get or create a variable collection with the given modes. */
async function collection(name: string, modes: string[] = ["light"]): Promise<VariableCollection> {
  const c = (await figma.variables.getLocalVariableCollectionsAsync()).find(v => v.name === name)
    ?? figma.variables.createVariableCollection(name)
  c.renameMode(c.modes[0].modeId, modes[0])
  for (const m of modes.slice(1)) if (!c.modes.find(x => x.name === m)) c.addMode(m)
  return c
}

/** Get or create a variable and set its value for the collection's first mode. */
async function variable(c: VariableCollection, name: string, type: VariableResolvedDataType, value: VariableValue): Promise<Variable> {
  const v = (await figma.variables.getLocalVariablesAsync(type)).find(x => x.name === name && x.variableCollectionId === c.id)
    ?? figma.variables.createVariable(name, c, type)
  v.setValueForMode(c.modes[0].modeId, value)
  return v
}

/** Hex "#RRGGBB" to Figma RGB. */
function rgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

/** Solid paint bound to a color variable. */
function boundFill(v: Variable): SolidPaint {
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v)
}

/** Move a node to the Archive page instead of deleting it. */
function archive(node: SceneNode) {
  page("🗄 Archive").appendChild(node)
}
