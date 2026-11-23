// QA fix: Arabic helper text inside components that uses Caption (12) with 3+ words becomes Body/M (14).
// Edits the main components on 02 Components in place; instances and screens follow. Safe to re-run.
await loadDS()
const pg = page("Design System"); await pg.loadAsync()
let n = 0
for (const t of pg.findAll(x => x.type === "TEXT")) {
  if (t.textStyleId !== DS.S["Caption"].id) continue
  if (!/[؀-ۿ]/.test(t.characters) || t.characters.split(/\s+/).length < 3) continue
  await t.setTextStyleIdAsync(DS.S["Body/M"].id); n++
}
print("component captions promoted: " + n)

// Helper/hint texts named "hint" inside components (input, phone, otp) are helper copy: 14, not 12.
let h = 0
for (const t of pg.findAll(x => x.type === "TEXT" && x.name === "hint" && x.textStyleId === DS.S["Caption"].id)) { await t.setTextStyleIdAsync(DS.S["Body/M"].id); h++ }
// Empty text nodes (skeleton leftovers) are invisible but noise: remove them from screens.
let e = 0
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin"]) { const p = page(pn); await p.loadAsync(); for (const t of p.findAll(x => x.type === "TEXT" && x.characters.trim() === "")) { t.remove(); e++ } }
print("hints promoted: " + h + ", empty texts removed: " + e)

// Section containers: a variable-bound paint renders black on Sections in this file, so give the Section canvas the cream hex directly.
// (Screens inside stay bound to variables; this only colors the organizing Section.)
let sc = 0
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin"]) { const p = page(pn); await p.loadAsync(); for (const s of p.children.filter(x => x.type === "SECTION")) { s.fills = [{ type: "SOLID", color: rgb(DS.T.color.bg.value) }]; sc++ } }
print("section fills set: " + sc)
