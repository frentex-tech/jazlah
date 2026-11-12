// Prints the screen index as plain lines (read from the Scripter output; used to build docs/design/screens.md).
// P|pageName                              one per product page
// F|nodeId|row|blk|arabicName|englishName  one per screen (row = app | web | dash, blk = the feature it was built as)
// L|pageName|flowName|startScreenName      one per flow starting point
const out = []
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await pg.loadAsync(); out.push("P|" + pg.name)
  for (const f of pg.children.filter(n => n.type === "FRAME").sort((a, b) => a.y - b.y || a.x - b.x))
    out.push(["F", f.id, f.getSharedPluginData(NS, "row"), f.getSharedPluginData(NS, "blk"), f.name, f.getSharedPluginData(NS, "en")].join("|"))
  for (const fl of pg.flowStartingPoints) { const n = await figma.getNodeByIdAsync(fl.nodeId); out.push(["L", pg.name, fl.name, n ? n.name : "?"].join("|")) }
}
print("EXPORT-BEGIN\n" + out.join("\n") + "\nEXPORT-END")
