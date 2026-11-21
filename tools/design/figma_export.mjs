#!/usr/bin/env node
// Read-only export from the live Figma file through Chrome DevTools (no Figma token needed).
// 1. Open the file in the Jazlah Figma Chrome profile with a debug port:
//    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9223 --user-data-dir="$HOME/.chrome-jazlah-figma"
// 2. node tools/design/figma_export.mjs <ids-file> [--png]
//    <ids-file>: lines "<node-id> <platform> <task>" (platform = app | dashboard | ds). Writes docs/design/spec/<platform>/<id>.json
//    and, with --png, docs/design/exports/<platform-dir>/<id>.png (app 1x, dashboard 0.5x).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = process.env.FIGMA_CDP_PORT || 9223;
const [idsFile, ...flags] = process.argv.slice(2);
const png = flags.includes('--png');
const rows = fs.readFileSync(idsFile, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => { const [id, platform, ...task] = l.split(/\s+/); return { id: id.replace('-', ':'), platform, task: task.join(' ') }; });
const page = (await (await fetch(`http://localhost:${port}/json/list`)).json()).find(p => p.type === 'page' && p.url.includes('figma.com/design'));
if (!page) throw new Error('No Figma design tab on port ' + port);
const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let seq = 0; const pend = {};
ws.onmessage = e => { const m = JSON.parse(e.data); pend[m.id]?.(m); delete pend[m.id]; };
const evaluate = async expr => { const id = ++seq; ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true, timeout: 600000 } })); const m = await new Promise(r => pend[id] = r); if (m.result.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 800)); return m.result.result.value; };
const specSrc = fs.readFileSync(path.join(root, 'tools/design/spec-in-figma.js'), 'utf8');
const dirOf = p => p === 'dashboard' ? 'dashboards' : p;
for (let i = 0; i < rows.length; i += 10) {
  const batch = rows.slice(i, i + 10);
  const specs = await evaluate(`globalThis.__SPEC_IDS=${JSON.stringify(batch.map(b => b.id))};` + specSrc);
  for (const b of batch) {
    const s = specs[b.id]; s.task = b.task;
    const f = path.join(root, 'docs/design/spec', b.platform, b.id.replace(':', '-') + '.json');
    fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(s) + '\n');
    if (png && b.platform !== 'ds') {
      const pf = path.join(root, 'docs/design/exports', dirOf(b.platform), b.id.replace(':', '-') + '.png'); if (fs.existsSync(pf)) { console.log(b.id, s.name, '(png exists)'); continue; }
      const scale = b.platform === 'app' ? 1 : 0.5;
      const b64 = await evaluate(`const n=await figma.getNodeByIdAsync(${JSON.stringify(b.id)});const u=await n.exportAsync({format:'PNG',constraint:{type:'SCALE',value:${scale}}});let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);`);
      fs.mkdirSync(path.dirname(pf), { recursive: true }); fs.writeFileSync(pf, Buffer.from(b64, 'base64'));
    }
    console.log(b.id, s.name, s.error || '');
  }
}
ws.close();
