// DSN-DES-1, batch 2: core components (buttons, inputs, selection, navigation, feedback) on page 02 Components.
// Needs batch 01 first (variables and text styles). All components are RTL; horizontal rows list children start→end (right→left).
// Text properties are exposed only where every variant shares the same text (they would override the per-variant copy).
await loadDS()
const ctx = { y: 0 }
const P = "02 Components"
const label = async (body, ar, en) => add(body, await txt(`${ar} · ${en}`, "Heading/H3"), "h")
const SH = ["default", "pressed", "disabled", "loading"]

// ---- Buttons -------------------------------------------------------------------
await sectionOn(ctx, P, "sec-buttons", "الأزرار · Buttons", async body => {
  await label(body, "الأزرار", "Button (variant × state × size)")
  await defineSet(body, "button", "Button", { variant: ["primary", "secondary", "ghost", "danger"], state: SH, size: ["L", "S"] }, async ({ variant, state, size }) => {
    const L = size === "L"
    const base = { primary: ["ember", "paper", null], secondary: ["paper", "ember", "ember"], ghost: [null, "ember", null], danger: ["danger", "paper", null] }[variant]
    let [fill, text, stroke] = base
    if (state === "pressed") fill = { primary: "ember-2", secondary: "sand", ghost: "sand", danger: "danger" }[variant]
    if (state === "disabled") { fill = variant === "primary" || variant === "danger" ? "sand" : variant === "secondary" ? "paper" : null; text = "muted-soft"; stroke = variant === "secondary" ? "line" : null }
    const c = frame("button", { comp: true, dir: "HORIZONTAL", h: L ? 52 : 36, px: L ? 24 : 16, gap: 8, main: "CENTER", cross: "CENTER", fill, stroke, r: L ? "md" : "sm" })
    if (variant === "danger" && state === "pressed") c.fills = [paint("danger", 0.85)]
    if (state === "loading") {
      const sp = circle("spinner", 16, text); sp.arcData = { startingAngle: 0, endingAngle: 4.71, innerRadius: 0.7 }; add(c, sp)
    }
    add(c, await txt("اطلب الآن", L ? "Heading/H3" : "Label/M", text, { name: "label" }))
    if (state !== "disabled") chk(`button ${variant}/${state}`, text, variant === "danger" && state === "pressed" ? ["danger", 0.85, "paper"] : fill || "bg")
    return c
  }, ["label"])
})

// ---- Inputs --------------------------------------------------------------------
await sectionOn(ctx, P, "sec-inputs", "الحقول · Inputs", async body => {
  await label(body, "حقل نصي", "Input")
  await defineSet(body, "input", "Input", { state: ["default", "focused", "filled", "error", "disabled"] }, async ({ state }) => {
    const err = state === "error", foc = state === "focused", dis = state === "disabled", val = state === "filled" || err
    const c = frame("input", { comp: true, w: 342, gap: 8 })
    add(c, await txt("الاسم الكامل", "Label/M", "ink-2", { name: "label", w: 342 }), "h")
    const f = frame("field", { dir: "HORIZONTAL", h: 52, px: 16, cross: "CENTER", fill: dis ? "sand" : err ? "danger-bg" : "paper", stroke: err ? "danger" : foc ? "ember" : "line", sw: foc ? 2 : 1, r: "sm" })
    add(f, await txt(val ? "عبدالرحمن محمد" : "اكتب هنا", "Body/L", val ? "ink" : dis ? "muted-soft" : "muted", { name: "value" }), "h")
    add(c, f, "h")
    add(c, await txt(err ? "هذا الحقل مطلوب" : "نص مساعد", "Caption", err ? "danger" : "muted", { name: "hint", w: 342 }), "h")
    if (val) chk(`input ${state} value`, "ink", err ? "danger-bg" : "paper")
    if (!val && !dis) chk("input placeholder", "muted", "paper")
    chk(`input ${state} hint`, err ? "danger" : "muted", "bg")
    return c
  }, ["label"])

  await label(body, "رقم الجوال", "Phone input (+966, number stays LTR)")
  await defineSet(body, "phone-input", "Phone input", { state: ["default", "error", "disabled"] }, async ({ state }) => {
    const err = state === "error", dis = state === "disabled"
    const c = frame("phone-input", { comp: true, w: 342, gap: 8 })
    add(c, await txt("رقم الجوال", "Label/M", "ink-2", { name: "label", w: 342 }), "h")
    const row = frame("row", { dir: "HORIZONTAL", gap: 8, h: 52 })
    const pre = frame("prefix", { dir: "HORIZONTAL", w: 88, h: 52, main: "CENTER", cross: "CENTER", fill: "sand", stroke: "line", r: "sm" })
    add(pre, await txt("+966", "Label/M", dis ? "muted-soft" : "ink", { align: "CENTER" }))
    const f = frame("field", { dir: "HORIZONTAL", h: 52, px: 16, cross: "CENTER", fill: dis ? "sand" : err ? "danger-bg" : "paper", stroke: err ? "danger" : "line", r: "sm" })
    add(f, await txt(err ? "5X XXX" : "5X XXX XXXX", "Body/L", err ? "ink" : dis ? "muted-soft" : "muted", { name: "value", align: "LEFT" }), "h")
    add(row, pre); add(row, f, "h"); add(c, row, "h")
    add(c, await txt(err ? "رقم الجوال غير مكتمل" : "سنرسل لك رمز التحقق", "Caption", err ? "danger" : "muted", { name: "hint", w: 342 }), "h")
    chk("phone hint", err ? "danger" : "muted", "bg")
    return c
  }, ["label"])

  await label(body, "رمز التحقق", "OTP field (4 digits, LTR order)")
  await defineSet(body, "otp-field", "OTP field", { state: ["default", "filled", "error"] }, async ({ state }) => {
    const c = frame("otp-field", { comp: true, w: 280, gap: 8, cross: "CENTER" })
    const row = frame("cells", { dir: "HORIZONTAL", ltr: true, gap: 12 })
    for (let i = 0; i < 4; i++) {
      const cell = frame("cell", { dir: "HORIZONTAL", w: 56, h: 64, main: "CENTER", cross: "CENTER", fill: state === "error" ? "danger-bg" : "paper", stroke: state === "error" ? "danger" : state === "default" && i === 0 ? "ember" : "line", sw: state === "default" && i === 0 ? 2 : 1, r: "md", ltr: true })
      if (state !== "default") add(cell, await txt(["4", "8", "1", "6"][i], "Heading/H1", "ink", { align: "CENTER" }))
      add(row, cell)
    }
    add(c, row)
    if (state === "error") { add(c, await txt("الرمز غير صحيح، حاول مرة أخرى", "Caption", "danger", { name: "hint", align: "CENTER" })); chk("otp error hint", "danger", "bg") }
    chk("otp digit", "ink", "paper")
    return c
  })
})

// ---- Selection -----------------------------------------------------------------
await sectionOn(ctx, P, "sec-select", "الاختيار · Selection", async body => {
  await label(body, "شريحة", "Chip")
  await defineSet(body, "chip", "Chip", { state: ["default", "selected", "disabled"] }, async ({ state }) => {
    const fill = { default: "paper", selected: "brand", disabled: "sand" }[state], text = { default: "ink", selected: "paper", disabled: "muted-soft" }[state]
    const c = frame("chip", { comp: true, dir: "HORIZONTAL", h: 40, px: 16, main: "CENTER", cross: "CENTER", fill, stroke: state === "default" ? "line" : null, r: "pill" })
    add(c, await txt("خروف نعيمي", "Label/M", text, { name: "label" }))
    if (state !== "disabled") chk(`chip ${state}`, text, fill)
    return c
  }, ["label"])

  const ctl = async (id, name, kind) => {
    await label(body, name[0], name[1])
    await defineSet(body, id, name[1], { checked: ["yes", "no"], state: ["default", "disabled"] }, async ({ checked, state }) => {
      const on = checked === "yes", dis = state === "disabled"
      const c = frame(id, { comp: true, dir: "HORIZONTAL", gap: 12, cross: "CENTER", h: 44 })
      const col = dis ? "muted-soft" : on ? "ember" : "muted"
      let ctrl
      if (kind === "radio") {
        ctrl = frame("radio", { dir: "HORIZONTAL", w: 24, h: 24, main: "CENTER", cross: "CENTER", stroke: col, sw: 2, r: "pill", ltr: true })
        if (on) add(ctrl, circle("dot", 12, col))
      }
      else if (kind === "checkbox") {
        ctrl = frame("checkbox", { dir: "HORIZONTAL", w: 24, h: 24, main: "CENTER", cross: "CENTER", fill: on && !dis ? "ember" : on ? "sand" : null, stroke: on && !dis ? "ember" : col, sw: 2, r: 6, ltr: true })
        if (on) add(ctrl, await txt("✓", "Label/M", dis ? "muted-soft" : "paper", { align: "CENTER" }))
      } else {
        ctrl = frame("switch", { dir: "HORIZONTAL", ltr: true, w: 48, h: 28, px: 3, cross: "CENTER", main: on ? "MIN" : "MAX", fill: on && !dis ? "ember" : "sand", stroke: on && !dis ? null : col, r: "pill" })
        add(ctrl, circle("knob", 22, on && !dis ? "paper" : col))
      }
      add(c, ctrl)
      add(c, await txt("إضافة تغليف هدية", "Body/L", dis ? "muted-soft" : "ink", { name: "label" }))
      if (!dis) chk(`${kind} control ${checked}`, on ? "ember" : "muted", "bg", 3)
      return c
    }, ["label"])
  }
  await ctl("radio", ["زر اختيار", "Radio"], "radio")
  await ctl("checkbox", ["خانة اختيار", "Checkbox"], "checkbox")
  await ctl("switch", ["مفتاح تبديل (التشغيل = الكرة على اليسار في RTL)", "Switch"], "switch")

  await label(body, "عدّاد الكمية", "Stepper")
  await defineSet(body, "stepper", "Stepper", { state: ["default", "min", "disabled"] }, async ({ state }) => {
    const c = frame("stepper", { comp: true, dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
    const btn = async (g, kind) => {
      const off = state === "disabled" || (state === "min" && kind === "minus")
      const b = frame(kind, { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", ltr: true, r: "pill", fill: off ? "sand" : kind === "plus" ? "ember" : "paper", stroke: off || kind === "plus" ? null : "ember", sw: 2 })
      add(b, await txt(g, "Heading/H2", off ? "muted-soft" : kind === "plus" ? "paper" : "ember", { align: "CENTER" }))
      return b
    }
    add(c, await btn("+", "plus"))
    add(c, await txt(state === "min" ? "1" : "2", "Heading/H2", state === "disabled" ? "muted-soft" : "ink", { name: "qty", align: "CENTER", w: 40 }))
    add(c, await btn("−", "minus"))
    chk("stepper plus", "paper", "ember"); chk("stepper minus", "ember", "paper")
    return c
  })
})

// ---- Navigation ----------------------------------------------------------------
await sectionOn(ctx, P, "sec-nav", "التنقل · Navigation", async body => {
  await label(body, "تبويبات", "Tabs")
  const TABS = ["الوصف", "المكوّنات", "التقييمات"]
  await defineSet(body, "tabs", "Tabs", { active: ["1", "2", "3"] }, async ({ active }) => {
    const c = frame("tabs", { comp: true, dir: "HORIZONTAL", w: 342, h: 48 })
    for (let i = 0; i < 3; i++) {
      const on = String(i + 1) === active
      const t = frame("tab", { gap: 0, cross: "CENTER", main: "SPACE_BETWEEN" })
      add(t, await txt(TABS[i], "Label/M", on ? "ember" : "ink-2", { align: "CENTER", w: 110 }))
      add(t, rect("indicator", 110, on ? 3 : 1, on ? "ember" : "line"), "h")
      t.itemSpacing = 12
      add(c, t, "v"); t.layoutSizingHorizontal = "FILL"
    }
    chk("tab active", "ember", "bg"); chk("tab idle", "ink-2", "bg")
    return c
  })

  await label(body, "شريط التنقل السفلي", "Bottom tab bar (Home, Services, Orders, Account; icons are placeholders)")
  const NAV = ["الرئيسية", "الخدمات", "الطلبات", "حسابي"]
  await defineSet(body, "bottom-tab-bar", "Bottom tab bar", { active: ["1", "2", "3", "4"] }, async ({ active }) => {
    const c = frame("bottom-tab-bar", { comp: true, dir: "HORIZONTAL", w: 390, h: 84, px: 8, py: 8, fill: "paper" })
    c.strokes = [paint("line")]; c.strokeTopWeight = 1; c.strokeBottomWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0
    for (let i = 0; i < 4; i++) {
      const on = String(i + 1) === active
      const it = frame("item", { gap: 4, main: "CENTER", cross: "CENTER", ltr: true })
      add(it, circle("icon", 24, on ? "ember" : null, { stroke: on ? "ember" : "muted", sw: 2 }))
      add(it, await txt(NAV[i], "Label/M", on ? "ember" : "muted", { align: "CENTER" }))
      add(c, it); it.layoutSizingHorizontal = "FILL"; it.layoutSizingVertical = "FILL"
    }
    chk("tab bar active", "ember", "paper"); chk("tab bar idle", "muted", "paper")
    return c
  })
})

// ---- Feedback ------------------------------------------------------------------
await sectionOn(ctx, P, "sec-feedback", "التنبيهات والنوافذ · Feedback & overlays", async body => {
  await label(body, "رسالة عابرة", "Toast")
  const MSG = { success: "تمت إضافة المنتج إلى السلة", error: "تعذّر إتمام العملية، حاول مرة أخرى", warning: "الكمية المتاحة محدودة", info: "سيصلك إشعار عند تجهيز الطلب" }
  await defineSet(body, "toast", "Toast", { type: ["success", "error", "warning", "info"] }, async ({ type }) => {
    const c = frame("toast", { comp: true, dir: "HORIZONTAL", w: 342, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "ink", r: "md" })
    add(c, circle("status", 12, type === "error" ? "danger" : type))
    add(c, await txt(MSG[type], "Body/M", "paper", { name: "label", w: 280 }), "h")
    chk(`toast ${type}`, "paper", "ink")
    return c
  })

  await label(body, "نافذة تأكيد", "Dialog")
  await defineSet(body, "dialog", "Dialog", { type: ["default", "destructive"] }, async ({ type }) => {
    const d = type === "destructive"
    const c = frame("dialog", { comp: true, w: 320, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "lg" })
    add(c, await txt(d ? "حذف العنوان؟" : "تأكيد الطلب؟", "Heading/H2", "ink", { name: "title", w: 272 }), "h")
    add(c, await txt(d ? "لن تتمكن من استرجاع هذا العنوان بعد الحذف." : "سيتم إرسال طلبك إلى المتجر فور التأكيد.", "Body/M", "ink-2", { name: "body", w: 272 }), "h")
    const row = frame("actions", { dir: "HORIZONTAL", gap: 12 })
    const ok = inst("button", { variant: d ? "danger" : "primary", state: "default", size: "L" }); setProp(ok, "label", d ? "حذف" : "تأكيد")
    const no = inst("button", { variant: "secondary", state: "default", size: "L" }); setProp(no, "label", "إلغاء")
    add(row, ok, "h"); add(row, no, "h"); add(c, row, "h")
    await shade(c)
    chk("dialog title", "ink", "paper"); chk("dialog body", "ink-2", "paper")
    return c
  })

  await label(body, "ورقة سفلية", "Bottom sheet")
  const sh = frame("bottom-sheet", { comp: true, w: 390, pad: 24, gap: 16, fill: "paper", cross: "MIN" })
  for (const k of ["topLeftRadius", "topRightRadius"]) sh.setBoundVariable(k, DS.RD.lg)
  const handle = frame("handle", { w: 342, h: 4, cross: "CENTER", main: "CENTER" }); add(handle, rect("grip", 40, 4, "line", "pill")); add(sh, handle, "h")
  add(sh, await txt("اختر الحجم", "Heading/H2", "ink", { name: "title", w: 342 }), "h")
  const slot = frame("content", { h: 120, w: 342, main: "CENTER", cross: "CENTER", fill: "sand", r: "md" }); add(slot, await txt("المحتوى", "Body/M", "ink-2", { align: "CENTER" })); add(sh, slot, "h")
  add(sh, inst("button", { variant: "primary", state: "default", size: "L" }), "h")
  await shade(sh)
  const shSet = defineOne(body, "bottom-sheet", "Bottom sheet", sh)
  chk("sheet title", "ink", "paper")
})

figma.viewport.scrollAndZoomIntoView(page(P).children)
print("✅ batch 2 done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
