// DSN-DES-1, batch 3b: dashboard components (side nav, top bar, page header, KPI card, data table, filters, form layout)
// on page 02 Components. Needs batches 1, 2 and 3a (badge, state panel, input, button). Dashboard width is 1440 (nav 260 + content 1180).
await loadDS()
const ctx = { y: 0 }
const P = "02 Components"
const lbl = async (body, ar, en) => add(body, await txt(`${ar} · ${en}`, "Heading/H3"), "h")
{ const pg = page(P); await figma.setCurrentPageAsync(pg); const own = ["sec-dash-nav", "sec-dash-table", "sec-dash-filters", "sec-dash-form"]
  const rest = pg.children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- Side nav, top bar, page header, KPI --------------------------------------------------
await sectionOn(ctx, P, "sec-dash-nav", "التنقل ولوحة الصفحة · Dashboard shell", async body => {
  await lbl(body, "عنصر القائمة الجانبية", "Nav item")
  await defineSet(body, "nav-item", "Nav item", { state: ["default", "active"], badge: ["no", "yes"] }, async ({ state, badge }) => {
    const on = state === "active"
    const c = frame("nav-item", { comp: true, dir: "HORIZONTAL", w: 236, h: 44, px: 12, gap: 12, cross: "CENTER", fill: on ? "brand-2" : null, r: "sm" })
    add(c, await icon("receipt", 22, on ? "gold-light" : "sand", on ? "fill" : "regular"))
    add(c, await txt("الطلبات", "Label/M", on ? "paper" : "sand", { name: "label" }), "h")
    if (badge === "yes") { const b = frame("count", { dir: "HORIZONTAL", w: 24, h: 20, main: "CENTER", cross: "CENTER", fill: "gold-light", r: "pill" }); add(b, await txt("5", "Caption", "brand", { align: "CENTER" })); add(c, b); chk("nav count", "brand", "gold-light") }
    chk(`nav item ${state}`, on ? "paper" : "sand", on ? "brand-2" : "brand"); chk("nav active icon", "gold-light", "brand-2", 3)
    return c
  })

  await lbl(body, "القائمة الجانبية لكل دور", "Side nav (admin, vendor, kitchen)")
  const NAV = {
    admin: [["chart-line-up", "لوحة المعلومات"], ["receipt", "الطلبات"], ["storefront", "المتاجر"], ["package", "المنتجات"], ["users", "العملاء"], ["truck", "التوصيل"], ["bank", "المالية"], ["gear", "الإعدادات"]],
    vendor: [["list-checks", "لوحة الطلبات"], ["package", "منتجاتي"], ["wallet", "الأرباح"], ["storefront", "ملف المتجر"], ["gear", "الإعدادات"]],
    kitchen: [["cooking-pot", "الطلبات الجارية"], ["calendar-blank", "الجدول"], ["fork-knife", "الأطباق"], ["gear", "الإعدادات"]],
  }
  const ROLE = { admin: "الإدارة", vendor: "البائع", kitchen: "المطبخ" }
  await defineSet(body, "side-nav", "Side nav", { role: Object.keys(NAV) }, async ({ role }) => {
    const c = frame("side-nav", { comp: true, w: 260, h: 640, pad: 12, gap: 4, fill: "brand" })
    const head = frame("head", { px: 12, py: 12, gap: 2 })
    add(head, await txt("جزلة", "Display/L", "gold-light", { name: "wordmark" })); add(head, await txt(ROLE[role], "Caption", "sand")); add(c, head, "h")
    for (let i = 0; i < NAV[role].length; i++) {
      const [ic, label] = NAV[role][i], on = i === 1 || (role !== "admin" && i === 0)
      const it = frame("nav-item", { dir: "HORIZONTAL", h: 44, px: 12, gap: 12, cross: "CENTER", fill: on ? "brand-2" : null, r: "sm" })
      add(it, await icon(ic, 22, on ? "gold-light" : "sand", on ? "fill" : "regular"))
      add(it, await txt(label, "Label/M", on ? "paper" : "sand", { name: "label" }), "h")
      add(c, it, "h")
    }
    const spacer = frame("spacer", {}); add(c, spacer); spacer.layoutSizingVertical = "FILL"
    const out = frame("signout", { dir: "HORIZONTAL", h: 44, px: 12, gap: 12, cross: "CENTER" })
    add(out, await icon("sign-out", 22, "sand")); add(out, await txt("تسجيل الخروج", "Label/M", "sand"), "h"); add(c, out, "h")
    chk("side nav text", "sand", "brand"); chk("side nav wordmark", "gold-light", "brand")
    return c
  })

  await lbl(body, "الشريط العلوي", "Top bar")
  const tb = frame("top-bar", { comp: true, dir: "HORIZONTAL", w: 1180, h: 64, px: 24, gap: 16, cross: "CENTER", fill: "paper", main: "SPACE_BETWEEN" })
  const s = frame("search", { dir: "HORIZONTAL", w: 360, h: 40, px: 12, gap: 8, cross: "CENTER", fill: "bg", stroke: "line", r: "sm" })
  add(s, await icon("magnifying-glass", 18, "ink-2")); add(s, await txt("ابحث برقم الطلب أو العميل", "Body/M", "muted"), "h"); add(tb, s)
  const right = frame("user", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
  const av = frame("avatar", { dir: "HORIZONTAL", w: 36, h: 36, main: "CENTER", cross: "CENTER", fill: "brand", r: "pill" }); add(av, await txt("ع", "Label/M", "paper", { align: "CENTER" }))
  add(right, av); add(right, await txt("عبدالرحمن", "Label/M", "ink"))
  const bell = frame("bell", { dir: "HORIZONTAL", w: 40, h: 40, main: "CENTER", cross: "CENTER", fill: "bg", r: "pill" }); add(bell, await icon("bell", 20, "ink")); add(right, bell)
  add(tb, right)
  defineOne(body, "top-bar", "Top bar", tb)
  chk("top bar placeholder", "muted", "bg"); chk("top bar name", "ink", "paper"); chk("avatar", "paper", "brand")

  await lbl(body, "رأس الصفحة", "Page header (breadcrumb, title, actions)")
  const ph = frame("page-header", { comp: true, dir: "HORIZONTAL", w: 1132, main: "SPACE_BETWEEN", cross: "CENTER" })
  const left = frame("titles", { gap: 4 })
  add(left, await txt("الطلبات / كل الطلبات", "Caption", "ink-2", { name: "breadcrumb" })); add(left, await txt("الطلبات", "Heading/H1", "ink", { name: "title" })); add(ph, left)
  const acts = frame("actions", { dir: "HORIZONTAL", gap: 12 })
  const sec = inst("button", { variant: "secondary", state: "default", size: "L" }); setProp(sec, "label", "تصدير")
  const pri = inst("button", { variant: "primary", state: "default", size: "L" }); setProp(pri, "label", "إضافة")
  add(acts, pri); add(acts, sec); add(ph, acts)
  defineOne(body, "page-header", "Page header", ph)
  chk("breadcrumb", "ink-2", "bg"); chk("page title", "ink", "bg")

  await lbl(body, "بطاقة مؤشر", "KPI card")
  await defineSet(body, "kpi-card", "KPI card", { trend: ["up", "down"] }, async ({ trend }) => {
    const up = trend === "up"
    const c = frame("kpi-card", { comp: true, w: 260, pad: 20, gap: 8, fill: "paper", stroke: "line", r: "md" })
    add(c, await txt("طلبات اليوم", "Body/M", "ink-2", { name: "label", w: 220 }), "h")
    add(c, await txt("128", "Display/L", "ink", { name: "value", w: 220 }), "h")
    const d = frame("delta", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
    add(d, await icon(up ? "arrow-up" : "arrow-down", 16, up ? "success" : "danger"))
    add(d, await txt(up ? "12% عن أمس" : "5% عن أمس", "Label/M", up ? "success" : "danger")); add(c, d)
    await shade(c)
    chk("kpi label", "ink-2", "paper"); chk(`kpi delta ${trend}`, up ? "success" : "danger", "paper")
    return c
  })
})

// ---- Data table ------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-dash-table", "الجدول · Data table", async body => {
  await lbl(body, "جدول البيانات (افتراضي، تحميل، فارغ، خطأ)", "Data table")
  const COLS = [["رقم الطلب", 130], ["العميل", 260], ["المتجر", 210], ["الحالة", 150], ["المبلغ", 120], ["التاريخ", 150], ["", 52]]
  const ROWS = [["#10482", "سعد العتيبي", "مجازر الفلاح", "warning", "245.00 ر.س", "10 نوفمبر 2026"], ["#10481", "نورة القحطاني", "ذبائح الرياض", "success", "1,180.00 ر.س", "10 نوفمبر 2026"],
    ["#10480", "فهد الدوسري", "مجازر الفلاح", "info", "89.00 ر.س", "9 نوفمبر 2026"], ["#10479", "أم خالد", "أسواق الراعي", "danger", "430.00 ر.س", "9 نوفمبر 2026"], ["#10478", "محمد الشهري", "ذبائح الرياض", "neutral", "312.50 ر.س", "9 نوفمبر 2026"]]
  const cell = (w, h = 56) => frame("cell", { dir: "HORIZONTAL", w, h, cross: "CENTER", px: 8 })
  await defineSet(body, "data-table", "Data table", { state: ["default", "loading", "empty", "error"] }, async ({ state }) => {
    const c = frame("data-table", { comp: true, w: 1136, fill: "paper", stroke: "line", r: "md", clip: true })
    const hd = frame("header", { dir: "HORIZONTAL", px: 32, h: 48, cross: "CENTER", fill: "sand" })
    for (const [t, w] of COLS) {
      const k = cell(w, 48)
      if (t) { add(k, await txt(t, "Label/M", "ink")); if (t === "المبلغ" || t === "التاريخ") add(k, await icon("caret-up-down", 14, "ink-2")) }
      add(hd, k)
    }
    add(c, hd, "h"); chk("table header", "ink", "sand")
    if (state === "default" || state === "loading") {
      for (let r = 0; r < ROWS.length; r++) {
        const row = frame("row", { dir: "HORIZONTAL", px: 32, h: 56, cross: "CENTER", stroke: null })
        row.strokes = [paint("line")]; row.strokeTopWeight = 0; row.strokeBottomWeight = 1; row.strokeLeftWeight = 0; row.strokeRightWeight = 0
        const R = ROWS[r]
        for (let i = 0; i < COLS.length; i++) {
          const k = cell(COLS[i][1])
          if (state === "loading") { if (i < 6) add(k, rect("sk", Math.min(COLS[i][1] - 40, 90 + (r % 3) * 20), 12, "sand", "pill")) }
          else if (i === 3) add(k, inst("badge", { type: R[3], size: "S" }))
          else if (i === 6) add(k, await icon("dots-three", 22, "ink-2"))
          else add(k, await txt(R[i], "Body/M", i === 0 ? "ember" : "ink"))
          add(row, k)
        }
        add(c, row, "h")
      }
      chk("table cell text", "ink", "paper"); chk("table id link", "ember", "paper")
      const pg = frame("pagination", { dir: "HORIZONTAL", px: 32, h: 56, cross: "CENTER", main: "SPACE_BETWEEN" })
      add(pg, await txt("عرض 1 إلى 5 من 128", "Body/M", "ink-2"))
      const pages = frame("pages", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
      const pb = async (t, on, ic) => { const b = frame("page", { dir: "HORIZONTAL", w: 36, h: 36, main: "CENTER", cross: "CENTER", fill: on ? "ember" : null, stroke: on ? null : "line", r: "sm" }); add(b, ic ? await icon(ic, 18, "ink") : await txt(t, "Label/M", on ? "paper" : "ink", { align: "CENTER" })); return b }
      add(pages, await pb("", false, "caret-right")); for (const [t, on] of [["1", true], ["2", false], ["3", false]]) add(pages, await pb(t, on)); add(pages, await pb("", false, "caret-left"))
      add(pg, pages); add(c, pg, "h"); chk("pagination text", "ink-2", "paper"); chk("pagination active", "paper", "ember")
    } else {
      const panel = inst("state-panel", { kind: state === "empty" ? "orders" : "error" })
      const wrap = frame("body", { dir: "HORIZONTAL", h: 320, main: "CENTER", cross: "CENTER" }); add(wrap, panel); add(c, wrap, "h")
    }
    return c
  })
})

// ---- Filters ---------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-dash-filters", "المرشحات · Filters", async body => {
  await lbl(body, "قائمة منسدلة", "Select")
  await defineSet(body, "select", "Select", { state: ["default", "filled", "open", "disabled"] }, async ({ state }) => {
    const dis = state === "disabled", filled = state === "filled", open = state === "open"
    const c = frame("select", { comp: true, dir: "HORIZONTAL", w: 200, h: 44, px: 12, gap: 8, cross: "CENTER", fill: dis ? "sand" : "paper", stroke: open ? "ember" : filled ? "ink-2" : "line", sw: open ? 2 : 1, r: "sm" })
    add(c, await txt(filled ? "قيد التجهيز" : "الحالة", "Body/M", dis ? "muted-soft" : filled ? "ink" : "ink-2", { name: "value" }), "h")
    add(c, await icon(open ? "caret-up" : "caret-down", 16, dis ? "muted-soft" : "ink-2"))
    if (!dis) chk(`select ${state}`, filled ? "ink" : "ink-2", "paper")
    return c
  })

  await lbl(body, "شريط المرشحات", "Filters bar")
  await defineSet(body, "filters-bar", "Filters bar", { state: ["default", "active"] }, async ({ state }) => {
    const on = state === "active"
    const c = frame("filters-bar", { comp: true, w: 1136, pad: 16, gap: 12, fill: "paper", stroke: "line", r: "md" })
    const row = frame("row", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
    const s = frame("search", { dir: "HORIZONTAL", w: 300, h: 44, px: 12, gap: 8, cross: "CENTER", fill: "bg", stroke: "line", r: "sm" })
    add(s, await icon("magnifying-glass", 18, "ink-2")); add(s, await txt("بحث", "Body/M", "muted"), "h"); add(row, s)
    add(row, inst("select", { state: on ? "filled" : "default" })); add(row, inst("select", { state: "default" })); add(row, inst("select", { state: "default" }))
    const d = frame("date", { dir: "HORIZONTAL", w: 200, h: 44, px: 12, gap: 8, cross: "CENTER", fill: "paper", stroke: "line", r: "sm" })
    add(d, await icon("calendar-blank", 18, "ink-2")); add(d, await txt("التاريخ", "Body/M", "ink-2"), "h"); add(row, d)
    const sp = frame("sp", {}); add(row, sp); sp.layoutSizingHorizontal = "FILL"
    const clear = inst("button", { variant: "ghost", state: on ? "default" : "disabled", size: "S" }); setProp(clear, "label", "مسح الكل"); add(row, clear)
    add(c, row, "h")
    if (on) {
      const chips = frame("applied", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
      for (const t of ["الحالة: قيد التجهيز", "المتجر: مجازر الفلاح"]) {
        const ch = frame("chip", { dir: "HORIZONTAL", h: 32, px: 12, gap: 6, cross: "CENTER", fill: "sand", r: "pill" })
        add(ch, await txt(t, "Label/M", "ink")); add(ch, await icon("x", 14, "ink-2")); add(chips, ch)
      }
      add(c, chips); chk("applied chip", "ink", "sand")
    }
    chk("filters placeholder", "muted", "bg"); chk("filters text", "ink-2", "paper")
    return c
  })
})

// ---- Form layout ------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-dash-form", "تخطيط النماذج · Form layout", async body => {
  await lbl(body, "قسم نموذج (العنوان يمين، الحقول يسار)", "Form section")
  await defineSet(body, "form-section", "Form section", { state: ["default", "error"] }, async ({ state }) => {
    const err = state === "error"
    const c = frame("form-section", { comp: true, dir: "HORIZONTAL", w: 1136, pad: 24, gap: 32, fill: "paper", stroke: err ? "danger" : "line", r: "md" })
    const info = frame("info", { w: 280, gap: 8 })
    add(info, await txt("المعلومات الأساسية", "Heading/H2", "ink", { name: "title", w: 280 }), "h")
    add(info, await txt("اسم المنتج ووصفه كما يظهر للعميل في المتجر.", "Body/M", "ink-2", { w: 280 }), "h")
    add(c, info)
    const fields = frame("fields", { gap: 20 });
    const r1 = frame("r1", { dir: "HORIZONTAL", gap: 24 }); add(r1, inst("input", { state: "filled" })); add(r1, inst("input", { state: err ? "error" : "default" })); add(fields, r1)
    const r2 = frame("r2", { dir: "HORIZONTAL", gap: 24 }); add(r2, inst("input", { state: "default" })); add(r2, inst("phone-input", { state: "default" })); add(fields, r2)
    add(c, fields)
    chk("form section copy", "ink-2", "paper")
    return c
  })

  await lbl(body, "شريط الإجراءات (الحذف منفصل بصريًا)", "Form actions bar")
  const fa = frame("form-actions", { comp: true, dir: "HORIZONTAL", w: 1136, px: 24, py: 16, main: "SPACE_BETWEEN", cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const keep = frame("keep", { dir: "HORIZONTAL", gap: 12 })
  const save = inst("button", { variant: "primary", state: "default", size: "L" }); setProp(save, "label", "حفظ")
  const cancel = inst("button", { variant: "secondary", state: "default", size: "L" }); setProp(cancel, "label", "إلغاء")
  add(keep, save); add(keep, cancel); add(fa, keep)
  const del = inst("button", { variant: "danger", state: "default", size: "L" }); setProp(del, "label", "حذف المنتج"); add(fa, del)
  defineOne(body, "form-actions", "Form actions", fa)
})

figma.viewport.scrollAndZoomIntoView(page(P).children)
print("✅ batch 3b done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
