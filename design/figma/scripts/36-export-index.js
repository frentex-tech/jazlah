// Prints the design index as plain lines (read them from the Scripter output; used to build docs/design/screens.md).
// S|page|sectionNodeId|pluginId|sectionName   one per Section
// F|frameNodeId|frameName                      one per top-level frame in the section above
// L|page|flowName|startFrameName               one per flow starting point
const out = []
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen", "90 Flows"]) {
  const pg = figma.root.children.find(p => p.name === pn); if (!pg) continue; await pg.loadAsync()
  for (const s of pg.children.filter(n => n.type === "SECTION")) {
    out.push(["S", pn.slice(0, 2), s.id, s.getSharedPluginData("jazlah", "id"), s.name].join("|"))
    for (const f of s.children.filter(n => n.type === "FRAME")) out.push(["F", f.id, f.name].join("|"))
  }
  for (const fl of pg.flowStartingPoints || []) { const n = await figma.getNodeByIdAsync(fl.nodeId); out.push(["L", pn.slice(0, 2), fl.name, n ? n.name : "?"].join("|")) }
}
print("EXPORT-BEGIN\n" + out.join("\n") + "\nEXPORT-END")
