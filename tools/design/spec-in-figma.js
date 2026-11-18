// Read-only. Runs inside the Figma editor tab (figma global). Input: globalThis.__SPEC_IDS = ['123:2794', ...]
// Output: { [id]: spec } — compact tree of every visible node with the values a build needs.
const ids = globalThis.__SPEC_IDS || [];
const r = v => Math.round(v * 2) / 2;
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const varName = {};
const vn = async id => { if (!(id in varName)) { const v = await figma.variables.getVariableByIdAsync(id); varName[id] = v ? v.name : id; } return varName[id]; };
const styleName = {};
const sn = async id => { if (!id || typeof id !== 'string') return undefined; if (!(id in styleName)) { const s = await figma.getStyleByIdAsync(id); styleName[id] = s ? s.name : undefined; } return styleName[id]; };
async function paints(list) {
  if (!Array.isArray(list)) return 'mixed';
  const out = [];
  for (const p of list) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') { const o = { c: hex(p.color) }; if (p.opacity < 1) o.a = +p.opacity.toFixed(2); if (p.boundVariables && p.boundVariables.color) o.var = await vn(p.boundVariables.color.id); out.push(o); }
    else if (p.type.startsWith('GRADIENT')) out.push({ g: p.type.replace('GRADIENT_', '').toLowerCase(), stops: p.gradientStops.map(s => hex(s.color) + (s.color.a < 1 ? '@' + (+s.color.a.toFixed(2)) : '') + ' ' + Math.round(s.position * 100) + '%'), a: p.opacity < 1 ? +p.opacity.toFixed(2) : undefined });
    else if (p.type === 'IMAGE') out.push({ image: p.scaleMode.toLowerCase() });
  }
  return out.length ? out : undefined;
}
async function node(n, ox, oy) {
  if (n.visible === false) return null;
  const b = n.absoluteBoundingBox || { x: 0, y: 0, width: n.width, height: n.height };
  const o = { n: n.name, t: n.type, x: r(b.x - ox), y: r(b.y - oy), w: r(b.width), h: r(b.height) };
  if (n.opacity !== undefined && n.opacity < 1) o.opacity = +n.opacity.toFixed(2);
  if (n.rotation) o.rot = Math.round(n.rotation);
  if ('fills' in n && n.type !== 'TEXT') { const f = await paints(n.fills); if (f) o.fill = f; }
  if ('strokes' in n && n.strokes.length) { const s = await paints(n.strokes); if (s) { o.stroke = s; o.sw = n.strokeWeight === figma.mixed ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight] : n.strokeWeight; if (n.strokeAlign !== 'INSIDE') o.sa = n.strokeAlign.toLowerCase(); if (n.dashPattern && n.dashPattern.length) o.dash = n.dashPattern; } }
  if ('cornerRadius' in n) { if (n.cornerRadius === figma.mixed) o.radius = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius]; else if (n.cornerRadius) o.radius = n.cornerRadius; }
  if ('effects' in n && n.effects.length) { const es = await sn(n.effectStyleId); o.effects = es || n.effects.filter(e => e.visible !== false).map(e => ({ t: e.type.toLowerCase(), c: e.color && hex(e.color) + '@' + (+e.color.a.toFixed(2)), x: e.offset && e.offset.x, y: e.offset && e.offset.y, blur: e.radius, spread: e.spread })); }
  if (n.boundVariables) { const bv = {}; for (const [k, v] of Object.entries(n.boundVariables)) if (!['fills', 'strokes', 'effects', 'textRangeFills'].includes(k) && v && v.id) bv[k] = await vn(v.id); if (Object.keys(bv).length) o.vars = bv; }
  if ('layoutMode' in n && n.layoutMode !== 'NONE') {
    o.layout = { dir: n.layoutMode === 'HORIZONTAL' ? 'row' : n.layoutMode === 'VERTICAL' ? 'col' : 'grid', pad: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft], gap: n.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 'auto' : n.itemSpacing, main: n.primaryAxisAlignItems.toLowerCase(), cross: n.counterAxisAlignItems.toLowerCase() };
    if (n.layoutWrap === 'WRAP') { o.layout.wrap = true; o.layout.rowGap = n.counterAxisSpacing; }
  }
  if ('layoutSizingHorizontal' in n && n.parent && 'layoutMode' in n.parent && n.parent.layoutMode !== 'NONE') { o.size = [n.layoutSizingHorizontal.toLowerCase(), n.layoutSizingVertical.toLowerCase()]; if (n.layoutPositioning === 'ABSOLUTE') o.abs = true; }
  if (n.clipsContent) o.clip = true;
  if (n.type === 'TEXT') {
    o.text = n.characters;
    const segs = n.getStyledTextSegments(['fontName', 'fontSize', 'lineHeight', 'letterSpacing', 'fills', 'textStyleId', 'textDecoration']);
    const seg = async s => ({ style: await sn(s.textStyleId), font: s.fontName.family + ' ' + s.fontName.style, size: s.fontSize, lh: s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + '%' : s.lineHeight.value, ls: s.letterSpacing.value ? s.letterSpacing.value + (s.letterSpacing.unit === 'PERCENT' ? '%' : 'px') : undefined, color: await paints(s.fills), deco: s.textDecoration !== 'NONE' ? s.textDecoration.toLowerCase() : undefined });
    if (segs.length === 1) Object.assign(o, await seg(segs[0])); else o.runs = await Promise.all(segs.map(async s => ({ text: s.characters, ...(await seg(s)) })));
    o.align = n.textAlignHorizontal.toLowerCase(); if (n.textAlignVertical !== 'TOP') o.valign = n.textAlignVertical.toLowerCase();
    if (n.textAutoResize !== 'NONE') o.resize = n.textAutoResize.toLowerCase();
    if (n.textTruncation === 'ENDING') o.ellipsis = n.maxLines || true;
    return o;
  }
  if (/^ph\//.test(n.name)) { o.icon = n.name.slice(3); const v = n.findOne && n.findOne(c => 'fills' in c && Array.isArray(c.fills) && c.fills.some(p => p.visible !== false) || 'strokes' in c && c.strokes.length); if (v) o.color = (await paints(v.fills && v.fills.length ? v.fills : v.strokes)); return o; }
  if (n.type === 'INSTANCE') { const m = await n.getMainComponentAsync(); if (m) { o.component = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name; if (m.parent && m.parent.type === 'COMPONENT_SET') o.variant = m.name; } }
  if (['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'].includes(n.type)) return o;
  if ('children' in n) { const kids = []; for (const c of n.children) { const k = await node(c, ox, oy); if (k) kids.push(k); } if (kids.length) o.kids = kids; }
  return o;
}
const out = {};
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { out[id] = { error: 'not found' }; continue; }
  const b = n.absoluteBoundingBox;
  const pd = {}; for (const k of n.getSharedPluginDataKeys('jazlah')) pd[k] = n.getSharedPluginData('jazlah', k);
  out[id] = { id, name: n.name, meta: pd, w: r(n.width), h: r(n.height), spec: await node(n, b.x, b.y) };
}
return out;
