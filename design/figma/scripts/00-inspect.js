// Prints the structure of the current Figma file. Run this first, before any change batch.
await ready()
const out = []
for (const p of figma.root.children) {
  out.push(`📄 ${p.name}`)
  for (const n of p.children) {
    const kind = n.type === "SECTION" ? "§" : n.type === "COMPONENT_SET" ? "◆◆" : n.type === "COMPONENT" ? "◆" : "▢"
    const size = "width" in n ? ` ${Math.round(n.width)}×${Math.round(n.height)}` : ""
    const id = n.getSharedPluginData(NS, "id")
    out.push(`   ${kind} ${n.name}${size}${id ? `  [${id}]` : ""}`)
    if (n.type === "SECTION" || n.type === "COMPONENT_SET") for (const c of n.children) out.push(`      · ${c.name}`)
  }
}
out.push(`\n🔗 prototype links: ${figma.root.findAll(n => "reactions" in n && n.reactions && n.reactions.length > 0).length}`)
for (const c of await figma.variables.getLocalVariableCollectionsAsync())
  out.push(`🎨 variables: ${c.name}, modes ${c.modes.map(m => m.name).join(", ")}, ${c.variableIds.length} vars`)
out.push(`🧩 local components: ${figma.root.findAllWithCriteria({ types: ["COMPONENT"] }).length}`)
print(out.join("\n"))
