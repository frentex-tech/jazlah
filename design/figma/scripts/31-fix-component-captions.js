// QA fix: Arabic helper text inside components that uses Caption (12) with 3+ words becomes Body/M (14).
// Edits the main components on 02 Components in place; instances and screens follow. Safe to re-run.
await loadDS()
const pg = page("02 Components"); await pg.loadAsync()
let n = 0
for (const t of pg.findAll(x => x.type === "TEXT")) {
  if (t.textStyleId !== DS.S["Caption"].id) continue
  if (!/[؀-ۿ]/.test(t.characters) || t.characters.split(/\s+/).length < 3) continue
  await t.setTextStyleIdAsync(DS.S["Body/M"].id); n++
}
print("component captions promoted: " + n)
