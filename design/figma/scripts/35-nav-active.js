// Side nav: the active item follows the screen (the component bakes a fixed active item). Re-runnable; run after any dashboard screen script.
// Role comes from the frame prefix (Admin/Vendor/Kitchen), the item from keywords in the path. Unmatched screens are listed, left as they are.
await loadDS()
const MAP = {
  Admin: [["الإعدادات", /setting|operation|config/], ["المالية", /financ|payout|settle|invoice|commission/], ["التوصيل", /deliver|driver|shipping|logistic/], ["العملاء", /customer|user/], ["المنتجات", /product|catalog|listing|feed\/listings/], ["العملاء", /report/], ["المتاجر", /vendor|store|shop|kitchens/], ["الطلبات", /order|occasion|adha|visit|cooking|quote/], ["لوحة المعلومات", /dashboard|home|overview|kpi/]],
  Vendor: [["الإعدادات", /setting/], ["الأرباح", /earn|payout|wallet/], ["منتجاتي", /product|catalog/], ["ملف المتجر", /profile|store|apply|status|onboard/], ["لوحة الطلبات", /order|dashboard|home/]],
  Kitchen: [["الإعدادات", /setting/], ["الأطباق", /dish|menu|product/], ["الجدول", /schedule|calendar|slot/], ["الطلبات الجارية", /order|queue|live|dashboard|home|board|cooking|visit/]],
}
const paintOf = k => paint(k)
let done = 0; const miss = {}
for (const pn of ["30 Admin", "31 Vendor", "32 Kitchen"]) {
  const pg = figma.root.children.find(p => p.name === pn); if (!pg) continue; await pg.loadAsync()
  for (const s of pg.findAll(n => n.type === "FRAME" && /^(Admin|Vendor|Kitchen)\// .test(n.name) && / — /.test(n.name))) {
    const [role, ...rest] = s.name.split(" — ")[0].split("/"), path = rest.join("/").toLowerCase()
    const nav = s.findOne(n => n.type === "INSTANCE" && n.name === "Side nav"); if (!nav) continue
    const hit = (MAP[role] || []).find(([, re]) => re.test(path)); if (!hit) { miss[s.name.split(" — ")[0]] = 1; continue }
    for (const it of nav.findAll(n => n.type === "FRAME" && n.name === "nav-item")) {
      const lab = it.findOne(n => n.type === "TEXT"); if (!lab) continue
      const on = lab.characters === hit[0]
      it.fills = on ? [paintOf("brand-2")] : []
      lab.fills = [paintOf(on ? "paper" : "sand")]
      for (const v of it.findAll(n => n.type === "VECTOR" || n.type === "BOOLEAN_OPERATION")) {
        if (v.fills.length) v.fills = [paintOf(on ? "gold-light" : "sand")]
        if (v.strokes.length) v.strokes = [paintOf(on ? "gold-light" : "sand")]
      }
    }
    done++
  }
}
print("NAV active set on " + done + " screens; unmatched paths: " + (Object.keys(miss).join(", ") || "none"))
