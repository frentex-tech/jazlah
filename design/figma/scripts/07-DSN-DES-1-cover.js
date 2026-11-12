// DSN-DES-1, batch 5c: 00 Cover. Project name, date and a clickable index of every page, section and flow.
// Run it last: it reads the sections that the other batches created and links to them (text hyperlinks to node ids).
await loadDS()
const ctx = { y: 0 }
{ const c = page("00 Cover"); await c.loadAsync(); c.children.filter(n => n.type !== "SECTION").forEach(n => n.remove()) } // strays from a failed run
const SKIP = ["00 Cover", "🗄 Archive"]
const SOON = { "10 Customer App": "تصاميم تطبيق العملاء (ACC, STF, SCH, OCC, FED, OPX)", "20 Customer Web": "نسخة الويب من شاشات العملاء", "30 Admin": "لوحة الإدارة", "31 Vendor": "لوحة البائع", "32 Kitchen": "لوحة المطبخ" }

// gather pages and their sections
const pages = []
for (const p of figma.root.children) {
  if (SKIP.includes(p.name)) continue
  await p.loadAsync()
  pages.push({ name: p.name, sections: p.children.filter(n => n.type === "SECTION").sort((a, b) => a.y - b.y).map(s => ({ id: s.id, name: s.name })) })
}

const link = async (str, nodeId, style = "Label/M") => {
  const t = await txt(str, style, nodeId ? "ember" : "ink-2", { align: "RIGHT" })
  if (nodeId) t.setRangeHyperlink(0, t.characters.length, { type: "NODE", value: nodeId })
  return t
}

await sectionOn(ctx, "00 Cover", "sec-cover", "الغلاف والفهرس · Cover & index", async body => {
  const hero = frame("hero", { w: 1200, pad: 48, gap: 12, fill: "brand-deep", r: "lg" })
  add(hero, await txt("جزلة", "Display/XL", "gold-light", { name: "wordmark" }), "h")
  add(hero, await txt("Jazlah — Product Design", "Heading/H1", "paper", { align: "LEFT" }), "h")
  add(hero, await txt("منصة اللحوم والمواشي متعددة المتاجر في المملكة العربية السعودية", "Body/L", "sand", { w: 1100 }), "h")
  const d = new Date().toISOString().slice(0, 10)
  add(hero, await txt(`Sprint 1 · DSN-DES-1 · ${d}`, "Label/M", "gold-light", { align: "LEFT" }), "h")
  add(hero, await txt("التصميم عربي (RTL) أولًا، والإنجليزية (LTR) تُشتق منه. كل القيم مربوطة بالمتغيرات من docs/design/tokens.json.", "Body/M", "sand", { w: 1100 }), "h")
  add(body, hero, "h"); chk("cover wordmark", "gold-light", "brand-deep"); chk("cover tagline", "sand", "brand-deep"); chk("cover title", "paper", "brand-deep")

  add(body, await txt("الفهرس · Index (اضغط على أي عنوان للانتقال)", "Heading/H2"), "h")
  const grid = frame("index", { dir: "HORIZONTAL", gap: 24, ltr: true }); grid.layoutWrap = "WRAP"; grid.counterAxisSpacing = 24
  body.appendChild(grid); grid.layoutSizingHorizontal = "FILL"
  for (const p of pages) {
    const card = frame("page " + p.name, { w: 384, pad: 16, gap: 8, fill: "paper", stroke: "line", r: "md" })
    const first = p.sections[0]
    add(card, await link(p.name, first && first.id, "Heading/H3"), "h")
    if (!p.sections.length) add(card, await txt(SOON[p.name] ? "قريبًا: " + SOON[p.name] : "قريبًا", "Body/M", "ink-2", { w: 352 }), "h")
    for (const s of p.sections) add(card, await link(s.name, s.id, "Body/M"), "h")
    grid.appendChild(card)
  }
  chk("index link", "ember", "paper"); chk("index text", "ink-2", "paper")
}, 1280)

figma.viewport.scrollAndZoomIntoView(page("00 Cover").children)
print("✅ batch 5c done\n" + ctx.ids.join("\n") + "\npages indexed: " + pages.map(p => p.name + " (" + p.sections.length + ")").join(", ") + "\n" + contrastReport())
