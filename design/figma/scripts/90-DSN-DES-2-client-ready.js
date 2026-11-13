// DSN-DES-2 (#204) client-ready pass, 2026-11-13. Run in the Figma file (console or Scripter), in this order:
//   1. this file (defines J and the builders)   2. await jzBuildChrome()   3. 91-DSN-DES-2-fixes.js
//   4. for (let i = 0; i < 7; i++) await jzLayout(i)   5. await jzMobile(); await jzWeb(); await jzDash()
// The prototype pages hold copies of the main screens: re-run step 5 after any design change.
// Recovered from the live session. Not re-run from this file yet: test on a duplicate of the Figma file first.
const J = window.J = { NS: 'jazlah', m: {}, img: {}, icons: {}, V: {} }
for (const s of ['Light','Regular','Medium','SemiBold','Bold']) { try { await figma.loadFontAsync({ family: 'Readex Pro', style: s }) } catch (e) {} }
for (const s of ['SemiBold','Bold']) { try { await figma.loadFontAsync({ family: 'El Messiri', style: s }) } catch (e) {} }
await figma.loadAllPagesAsync()
for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) J.V[v.name.split('/').pop()] = v
// icons come from the "Icon library (ph)" frame on the Design System page
const lib = figma.root.children[7].children.find(n => n.name === 'Icon library (ph)')
if (lib) lib.children.forEach(c => J.icons[c.name.slice(3)] = c)
// image hashes already in the file, keyed by hash (J.old('33c867') finds one by prefix)
window.jzImgs = {}
for (const pg of figma.root.children) pg.findAll(x => 'fills' in x && Array.isArray(x.fills) && x.fills.some(p => p.type === 'IMAGE')).forEach(x => { window.jzImgs[x.fills.find(p => p.type === 'IMAGE').imageHash] = 1 })
const LIVE = ['33c867','38c225','0709c5','f1f8bc']   // photos of live animals
const full = h => Object.keys(window.jzImgs).find(k => k.startsWith(h))
const set = figma.root.children[7].findOne(x => x.type === 'COMPONENT_SET' && x.name === 'Account nav')
J.tr = { push: { type: 'SLIDE_IN', direction: 'RIGHT', matchLayers: false, duration: .3, easing: { type: 'EASE_OUT' } }, tab: { type: 'DISSOLVE', duration: .15, easing: { type: 'EASE_OUT' } }, over: { type: 'MOVE_IN', direction: 'TOP', matchLayers: false, duration: .3, easing: { type: 'EASE_OUT' } }, web: { type: 'DISSOLVE', duration: .2, easing: { type: 'EASE_OUT' } } }

//#### lib
J.p = (k,a)=>{ let p; if(J.V[k]){ const val=Object.values(J.V[k].valuesByMode)[0]; p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:val.r,g:val.g,b:val.b}},'color',J.V[k]) } else { const h=k.replace('#',''); p={type:'SOLID',color:{r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}} } return a==null?p:{...p,opacity:a} }

J.t = (str,size=14,w='Regular',c='ink',o={})=>{ const t=figma.createText(); t.fontName=o.d?{family:'El Messiri',style:'Bold'}:{family:'Readex Pro',style:w}; t.fontSize=size; t.characters=String(str); t.fills=[J.p(c,o.a)]; t.textAlignHorizontal=o.align||'RIGHT'; t.name=o.name||String(str).slice(0,24); if(o.lh) t.lineHeight={unit:'PIXELS',value:o.lh}; if(o.w){ t.resize(o.w,t.height); t.textAutoResize='HEIGHT' } if(o.fill) J.fill(t,o.fill); return t }

J.f = (name,o={},kids=[])=>{ const f=o.comp?figma.createComponent():figma.createFrame(); f.name=name; f.fills=o.fill?[J.p(o.fill,o.alpha)]:[]; f.layoutMode=o.dir||'VERTICAL'; const H=f.layoutMode==='HORIZONTAL'; f.itemSpacing=o.gap||0; const pd=o.pad||[0,0]; f.paddingLeft=f.paddingRight=pd[0]; f.paddingTop=f.paddingBottom=pd[1]; if(o.pt!=null)f.paddingTop=o.pt; if(o.pb!=null)f.paddingBottom=o.pb; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO'; if(o.w!=null){ f.resize(o.w,f.height); if(H)f.primaryAxisSizingMode='FIXED'; else f.counterAxisSizingMode='FIXED' } if(o.h!=null){ f.resize(f.width,o.h); if(H)f.counterAxisSizingMode='FIXED'; else f.primaryAxisSizingMode='FIXED' }
const flip={MIN:'MAX',MAX:'MIN'}; f.primaryAxisAlignItems=H?(flip[o.main]||o.main||'MAX'):(o.main||'MIN'); f.counterAxisAlignItems=o.cross||(H?'CENTER':'MAX'); if(o.r!=null)f.cornerRadius=o.r; if(o.stroke){f.strokes=[J.p(o.stroke)];f.strokeWeight=o.sw||1;f.strokeAlign='INSIDE'} if(o.clip)f.clipsContent=true; if(o.wrap){f.layoutWrap='WRAP'; f.counterAxisSpacing=o.wrapGap!=null?o.wrapGap:o.gap||0} if(o.shadow)f.effects=[{type:'DROP_SHADOW',color:{r:.16,g:.07,b:.08,a:.14},offset:{x:0,y:8},radius:24,spread:-8,visible:true,blendMode:'NORMAL'}]; if(o.fillW)J.fill(f,o.fillW);
const list=H?[...kids].reverse():kids; for(const k of list){ if(!k) continue; f.appendChild(k); const m=J.m[k.id]||{}; if(m.abs){ k.layoutPositioning='ABSOLUTE'; k.x=m.abs[0]; k.y=m.abs[1] } else if(m.fill){ if(m.fill.includes('h'))k.layoutSizingHorizontal='FILL'; if(m.fill.includes('v'))k.layoutSizingVertical='FILL' } } return f }

J.fill = (n,s)=>J.set(n,'fill',s)

J.abs = (n,x,y)=>J.set(n,'abs',[x,y])

J.set = (n,k,v)=>{(J.m[n.id]=J.m[n.id]||{})[k]=v;return n}

J.line = ()=>{const r=figma.createRectangle(); r.resize(100,1); r.fills=[J.p('line')]; r.name='line'; return J.fill(r,'h')}

J.icon = (name,size=20,c='ink')=>{ const src=J.icons[name]; if(!src){ const r=figma.createFrame(); r.resize(size,size); r.fills=[]; r.name='ph/'+name+' MISSING'; return r } const n=src.clone(); if(n.layoutPositioning==='ABSOLUTE'){} n.rescale(size/n.width); n.findAll(x=>'fills' in x&&x.type!=='FRAME').forEach(x=>{ if(x.fills&&x.fills.length)x.fills=[J.p(c)]; if(x.strokes&&x.strokes.length)x.strokes=[J.p(c)] }); return n }

J.all = (pred)=>figma.root.children.slice(0,7).flatMap(p=>[...p.children,...p.children.filter(x=>x.type==='SECTION').flatMap(s=>s.children)]).filter(c=>(c.type==='FRAME'||c.type==='COMPONENT')&&(!pred||pred(c)))

J.g = (c,k)=>c.getSharedPluginData('jazlah',k)

J.ctx = (x)=>{ let p=x.parent, best=''; for(let i=0;i<3&&p&&p.type!=='PAGE'&&p.type!=='SECTION';i++){ if(p.width>420||p.height>520) break; const ts=p.findAll(n=>n.type==='TEXT').map(n=>n.characters).join(' '); if(ts.length>best.length) best=ts; if(best.length>12) break; p=p.parent } return best+' '+x.name }

J.pick = (ctx,cur)=>{ const live=LIVE.some(h=>cur.startsWith(h)); if(/برسيم|رودس/.test(ctx)) return 'alfalfa'; if(/شعير|ذرة|نخالة/.test(ctx)) return 'grain'; if(/مخزن|مستودع/.test(ctx)) return 'sacks'; if(/تبن|قش /.test(ctx)) return 'hayStack'; if(/علف|أعلاف/.test(ctx)) return /كيس|مركّز|مركز/.test(ctx)?'sacks':'hayStack'; if(/ماعز|تيس/.test(ctx)&&live) return 'goat'; if(/عجل|بقر/.test(ctx)&&live) return 'calf'; return null }

J.panel = (o)=>{ const bul=(ic,t,s)=>J.f('point',{dir:'HORIZONTAL',gap:14,main:'MIN'},[J.f('ic',{dir:'HORIZONTAL',w:44,h:44,r:999,fill:'gold-light',alpha:.16,main:'CENTER'},[J.icon(ic,22,'gold-light')]),J.f('tx',{gap:2},[J.t(t,16,'SemiBold','paper'),J.t(s,13,'Regular','paper',{a:.72})])]);
const em=figma.createFrame(); em.name='emblem'; em.resize(56,56); em.fills=[{type:'IMAGE',imageHash:full('47daad'),scaleMode:'FIT'}];
const logo=J.f('logo',{dir:'HORIZONTAL',gap:12,main:'MIN'},[em,J.t('جزلة',40,'Bold','gold-light',{d:1})]);
const copy=J.f('copy',{gap:28},[J.f('head',{gap:12},[J.t(o.title,44,'Bold','paper',{d:1,w:520,lh:60}),J.t(o.sub,16,'Regular','paper',{a:.8,w:520,lh:28})]),J.f('points',{gap:18},o.points.map(p=>bul(...p)))]);
const p=J.f('brand panel',{w:720,pad:[64,64],main:'SPACE_BETWEEN',clip:1},[logo,copy]); p.fills=[{type:'IMAGE',imageHash:o.img,scaleMode:'FILL'},{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{r:.14,g:.03,b:.035,a:.6}},{position:1,color:{r:.14,g:.03,b:.035,a:.96}}]}]; return p }

J.accWrap = (f,active)=>{ const body=f.children.find(c=>c.name==='body'); if(!body||body.findOne(x=>x.name==='account layout')) return 0; const kids=[...body.children]; const content=J.f('content',{gap:24}); const side=set.children.find(v=>v.name==='active='+active).createInstance(); const row=J.f('account layout',{dir:'HORIZONTAL',gap:32,cross:'MIN'}); body.appendChild(row); row.layoutSizingHorizontal='FILL'; row.appendChild(content); row.appendChild(side); content.layoutSizingHorizontal='FILL'; for(const k of kids){ content.appendChild(k); try{k.layoutSizingHorizontal='FILL'}catch(e){} }
content.findAll(x=>x.name==='page head'&&x.children.length===1).forEach(x=>x.primaryAxisAlignItems='MAX');
content.findAll(x=>x.name==='center').forEach(x=>{ try{x.layoutSizingVertical='HUG'}catch(e){} x.children.forEach(c=>{try{c.layoutSizingHorizontal='FILL'}catch(e){}}) }); body.primaryAxisAlignItems='MIN'; return 1 }

J.base = (pi,row)=>figma.root.children[pi].children.filter(c=>(c.type==='FRAME')&&J.g(c,'row')===row&&!c.name.includes(' · ')).sort((a,b)=>+J.g(a,'ord')-+J.g(b,'ord'))

J.old = h=>Object.keys(window.jzImgs).find(k=>k.startsWith(h))

//#### layout
window.jzLayout0 = async (pi) => {
const NS='jazlah'; const p=figma.root.children[pi]; await figma.setCurrentPageAsync(p);
await figma.loadFontAsync({family:'El Messiri',style:'Bold'}); await figma.loadFontAsync({family:'Readex Pro',style:'Regular'});
const g=(c,k)=>c.getSharedPluginData(NS,k);
p.findAll(n=>n.getSharedPluginData(NS,'jz')==='title').forEach(n=>n.remove());
let sec = p.children.find(n=>n.type==='SECTION'&&n.getSharedPluginData(NS,'jz')==='states');
const frames = [...p.children.filter(n=>n.type==='FRAME'||n.type==='COMPONENT'), ...(sec?sec.children.filter(n=>n.type==='FRAME'||n.type==='COMPONENT'):[])];
if(!frames.some(f=>g(f,'ord'))) for(const r of ['app','web','dash']) frames.filter(f=>g(f,'row')===r).sort((a,b)=>a.x-b.x).forEach((f,i)=>f.setSharedPluginData(NS,'ord',String(1000+i)));
const ord=f=>+(g(f,'ord')||9999);
const col=h=>({type:'SOLID',color:{r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}});
const mk=(parent,str,size,font,hex)=>{const t=figma.createText();t.fontName=font;t.fontSize=size;t.characters=str;t.fills=[col(hex)];t.textAlignHorizontal='RIGHT';t.setSharedPluginData(NS,'jz','title');t.name=str;parent.appendChild(t);return t};
const EM={family:'El Messiri',style:'Bold'}, RX={family:'Readex Pro',style:'Regular'};
const ROWS=[['app','تطبيق الجوال',14],['web','الموقع',6],['dash','لوحة التحكم',6]];
// returns placements relative to right edge; y absolute within block
const block=(pick)=>{ const out=[]; let y=0, W=0;
for(const [r,label,per] of ROWS){ const list=frames.filter(f=>g(f,'row')===r&&pick(f)); if(!list.length) continue;
const baseOrd={}; frames.filter(f=>g(f,'row')===r&&!f.name.includes(' · ')).forEach(f=>baseOrd[f.name]=ord(f));
list.sort((a,b)=>((baseOrd[a.name.split(' · ')[0]]??ord(a))-(baseOrd[b.name.split(' · ')[0]]??ord(b)))||(ord(a)-ord(b)));
out.push({title:label,sub:list.length+' شاشة',y}); y+=300;
const gap=r==='app'?100:120;
for(let i=0;i<list.length;i+=per){ const line=list.slice(i,i+per); let rx=0,h=0; for(const f of line){out.push({f,rx,y}); rx+=f.width+gap; h=Math.max(h,f.height)} W=Math.max(W,rx-gap); y+=h+180 }
y+=320 }
return {out,W,H:y-320-180+0} };
const A=block(f=>!f.name.includes(' · ')), S=block(f=>f.name.includes(' · '));
const put=(B,parent,rightX,y0)=>{ for(const o of B.out){ if(o.f){ if(o.f.parent!==parent) parent.appendChild(o.f); o.f.x=rightX-o.rx-o.f.width; o.f.y=y0+o.y } else { const t=mk(parent,o.title,120,EM,'4A1014'); t.x=rightX-t.width; t.y=y0+o.y; const s=mk(parent,o.sub,44,RX,'806865'); s.x=rightX-t.width-40-s.width; s.y=y0+o.y+90 } } };
put(A,p,0,0);
const h=mk(p,p.name,220,EM,'4A1014'); h.x=-h.width; h.y=-620;
const hs=mk(p,'جزلة · تصميم المنتج — '+A.out.filter(o=>o.f).length+' شاشة أساسية · '+S.out.filter(o=>o.f).length+' حالة',56,RX,'8E6129'); hs.x=-hs.width; hs.y=-300;
if(S.out.length){ if(!sec){sec=figma.createSection(); sec.setSharedPluginData(NS,'jz','states'); p.appendChild(sec)} sec.name='الحالات — تحميل · خطأ · فارغة · معبّأة'; sec.fills=[col('EEDFD3')];
const pad=240; sec.resizeWithoutConstraints(S.W+pad*2, S.H+pad*2+100); sec.x=-(S.W+pad*2)+pad; sec.y=A.H+900; put(S,sec,pad+S.W,pad) }
return p.name+' base '+A.out.filter(o=>o.f).length+' W '+Math.round(A.W)+' H '+Math.round(A.H)+' states '+S.out.filter(o=>o.f).length+' W '+Math.round(S.W)+' H '+Math.round(S.H);
}

window.jzLayout = async i=>{ const r=await window.jzLayout0(i); const p=figma.root.children[i]; p.backgrounds=[J.p('#171011')]; p.findAll(n=>n.getSharedPluginData(J.NS,'jz')==='title').forEach(t=>{ t.fills=[J.p(t.fontSize>=100?'#D9AE62':'#B9A79F')] }); const s=p.children.find(n=>n.type==='SECTION'); if(s) s.fills=[J.p('#231819')]; return r }

//#### chrome
window.jzBuildChrome = async()=>{ const ds=figma.root.children[7]; await figma.setCurrentPageAsync(ds);
ds.findAll(n=>n.getSharedPluginData(J.NS,'jz')==='webchrome').forEach(n=>n.remove());
const bottom=Math.max(...ds.children.map(c=>c.y+c.height)); const left=Math.min(...ds.children.map(c=>c.x));
const LINKS=[['home','الرئيسية'],['stores','المتاجر'],['services','الخدمات'],['account','حسابي']];
const mkHeader=(active)=>{ const links=J.f('links',{dir:'HORIZONTAL',gap:8},LINKS.map(([k,l])=>{ const on=k===active; return J.f('link/'+k,{dir:'HORIZONTAL',pad:[14,10],r:999,fill:on?'sand':null},[J.t(l,15,on?'SemiBold':'Regular',on?'ember':'ink-2')]) }));
const logo=J.f('logo',{dir:'HORIZONTAL',gap:10},[J.t('جزلة',32,'Bold','brand',{d:1,name:'wordmark'})]);
const loc=J.f('location',{dir:'HORIZONTAL',gap:6,pad:[12,8],r:999,stroke:'line'},[J.icon('map-pin',18,'ember'),J.t('التوصيل إلى',12,'Regular','muted'),J.t('الملقا، الرياض',13,'Medium','ink'),J.icon('caret-down',14,'muted')]);
const search=J.fill(J.f('search',{dir:'HORIZONTAL',gap:8,pad:[16,0],h:44,r:999,fill:'sand',main:'MIN'},[J.icon('magnifying-glass',18,'muted'),J.t('ابحث عن لحوم أو متاجر',14,'Regular','muted')]),'h');
const badge=J.abs(J.f('badge',{dir:'HORIZONTAL',pad:[5,1],r:999,fill:'ember',main:'CENTER'},[J.t('2',10,'SemiBold','paper')]),26,2);
const ib=(name,ic,extra)=>J.f(name,{dir:'HORIZONTAL',w:44,h:44,r:999,stroke:'line',main:'CENTER'},[J.icon(ic,20,'ink'),extra]);
const actions=J.f('actions',{dir:'HORIZONTAL',gap:10},[ib('notifications','bell'),ib('cart','shopping-bag',badge)]);
const h=J.f('active='+active,{comp:1,dir:'HORIZONTAL',gap:24,pad:[120,0],w:1440,h:80,fill:'paper',main:'MIN'},[logo,links,search,loc,actions]); h.strokes=[J.p('line')]; h.strokeBottomWeight=1; h.strokeTopWeight=0; h.strokeLeftWeight=0; h.strokeRightWeight=0; return h };
const hs=['home','stores','services','account','none'].map(mkHeader); hs.forEach(h=>ds.appendChild(h)); const set=figma.combineAsVariants(hs,ds); set.name='Web header'; set.layoutMode='VERTICAL'; set.itemSpacing=24; set.paddingLeft=set.paddingRight=set.paddingTop=set.paddingBottom=24; set.primaryAxisSizingMode='AUTO'; set.counterAxisSizingMode='AUTO'; set.x=left; set.y=bottom+400; set.setSharedPluginData(J.NS,'jz','webchrome'); set.fills=[J.p('bg')]; set.cornerRadius=16;
const colm=(title,items)=>J.f('col/'+title,{gap:14,w:170},[J.t(title,15,'SemiBold','gold-light'),...items.map(i=>J.t(i,14,'Regular','paper',{a:.78}))]);
const soc=(ic)=>J.f('social',{dir:'HORIZONTAL',w:40,h:40,r:999,stroke:'gold-deco',main:'CENTER'},[J.icon(ic,18,'gold-light')]);
const brandCol=J.fill(J.f('brand',{gap:16},[J.t('جزلة',40,'Bold','gold-light',{d:1}),J.t('منصة اللحوم والمواشي في المملكة: لحوم طازجة من متاجر موثّقة، ذبائح مناسبات، وأعلاف، بتوصيل في يومك.',14,'Regular','paper',{a:.78,w:340,lh:24}),J.f('contact',{gap:10},[J.f('r',{dir:'HORIZONTAL',gap:8},[J.icon('phone',18,'gold-light'),J.t('9200 12345',14,'Medium','paper')]),J.f('r',{dir:'HORIZONTAL',gap:8},[J.icon('chat-circle-text',18,'gold-light'),J.t('care@jazlah.sa',14,'Medium','paper')])]),J.f('socials',{dir:'HORIZONTAL',gap:10},[soc('chat-circle-text'),soc('camera'),soc('phone')])]),'h');
const cols=J.fill(J.f('columns',{dir:'HORIZONTAL',gap:48,cross:'MIN'},[brandCol,colm('عن جزلة',['من نحن','كيف نعمل','مناطق التغطية','الوظائف']),colm('للتجار',['انضم كتاجر','لوحة البائع','المطابخ المتعاقدة','شروط الشركاء']),colm('الدعم',['مركز المساعدة','تتبّع طلبك','الإلغاء والاسترجاع','تواصل معنا']),colm('السياسات',['الشروط والأحكام','سياسة الخصوصية','سياسة التوصيل','الفاتورة الضريبية'])]),'h');
const pay=J.f('payments',{dir:'HORIZONTAL',gap:8},['مدى','Visa','Mastercard','Apple Pay','STC Pay','تابي','تمارا'].map(n=>J.f('pay/'+n,{dir:'HORIZONTAL',pad:[12,6],r:8,fill:'paper',main:'CENTER'},[J.t(n,12,'SemiBold','brand')])));
const div=figma.createRectangle(); div.name='divider'; div.resize(1200,1); div.fills=[J.p('paper',.14)]; J.fill(div,'h');
const bar=J.fill(J.f('bottom',{dir:'HORIZONTAL',main:'SPACE_BETWEEN'},[J.t('© 2026 جزلة · جميع الحقوق محفوظة · الأسعار شاملة ضريبة القيمة المضافة 15%',12,'Regular','paper',{a:.6}),pay]),'h');
const ft=J.f('Web footer',{comp:1,gap:32,pad:[120,56],w:1440,fill:'brand-deep'},[cols,div,bar]); ft.paddingBottom=32; ds.appendChild(ft); ft.x=left; ft.y=set.y+set.height+200; ft.setSharedPluginData(J.NS,'jz','webchrome');
window.jzHeader=set.id; window.jzFooter=ft.id; figma.viewport.scrollAndZoomIntoView([set,ft]); return set.id+' '+ft.id+' '+ft.height }

//#### proto
J.proto0 = async(pageName,picks,per,gap,title)=>{ let pg=figma.root.children.find(p=>p.name===pageName); if(!pg){ pg=figma.createPage(); pg.name=pageName } await figma.setCurrentPageAsync(pg); [...pg.children].forEach(c=>c.remove()); pg.backgrounds=[J.p('#171011')]; pg.flowStartingPoints=[];
const C={pg,M:{},order:[],links:0,miss:[]}; let col=0,y=0,rowH=0;
for(const src of picks){ const c=src.clone(); pg.appendChild(c); let k=src.name; while(C.M[k]) k+=' ٢'; c.name=k; C.M[k]=c; C.order.push(c); c.x=-(col*(c.width+gap))-c.width; c.y=y; rowH=Math.max(rowH,c.height); col++; if(col>=per){ col=0; y+=rowH+200; rowH=0 } for(const n of c.findAll(n=>n.reactions&&n.reactions.length)){ try{ await n.setReactionsAsync([]) }catch(e){} } if(c.reactions&&c.reactions.length) await c.setReactionsAsync([]); c.clipsContent=true }
const h=J.t(title,180,'Bold','#D9AE62',{d:1}); pg.appendChild(h); h.x=-h.width; h.y=-520; const s=J.t('نسخة تفاعلية — اضغط ▶ Present من أعلى اليمين. الشاشات هنا نسخ من صفحات التصميم 01–07.',48,'Regular','#B9A79F'); pg.appendChild(s); s.x=-s.width; s.y=-250;
C.go=async(node,dest,kind)=>{ if(!node) return 0; const d=typeof dest==='string'?C.M[dest]:dest; if(kind!=='back'&&!d){ C.miss.push(String(dest)); return 0 } const act=kind==='back'?{type:'BACK'}:{type:'NODE',destinationId:d.id,navigation:kind==='over'?'OVERLAY':'NAVIGATE',transition:J.tr[kind||'push'],preserveScrollPosition:false}; try{ await node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[act]}]); C.links++; return 1 }catch(e){ C.err=(C.err||'')+e.message.slice(0,60)+' | '; return 0 } };
C.click=(t,root)=>{ let p=t.parent; while(p&&p!==root){ if(p.type==='INSTANCE'&&/^(Button|Chip|Product card|Store card|Category tile|Nav item)$/.test(p.name)) return p; p=p.parent } return t.parent===root?t:t.parent };
C.txt=async(screen,str,dest,kind)=>{ const s=typeof screen==='string'?C.M[screen]:screen; if(!s){ C.miss.push('S:'+screen); return 0 } let n=0; for(const t of s.findAll(x=>x.type==='TEXT'&&x.visible&&(str instanceof RegExp?str.test(x.characters):x.characters.trim()===str))){ n+=await C.go(C.click(t,s),dest,kind) } if(!n) C.miss.push(s.name.slice(0,14)+'→"'+String(str).slice(0,14)+'"'); return n };
C.named=async(screen,re,dest,kind)=>{ const s=typeof screen==='string'?C.M[screen]:screen; if(!s) return 0; let n=0; for(const x of s.findAll(x=>re.test(x.name)&&x.visible)) n+=await C.go(x,dest,kind); return n };
C.overlay=(name,src,child)=>{ const sh=src.children.find(c=>c.name===child); if(!sh) return null; const o=sh.clone(); pg.appendChild(o); o.name=name; o.x=200; o.y=Object.keys(C.M).filter(k=>C.M[k].x>0).length*900; o.layoutPositioning='AUTO'; C.M[name]=o; return o };
C.audit=()=>{ const ids=new Set(pg.findAll(()=>true).map(n=>n.id)); let total=0,broken=0,noPrimary=[]; for(const n of pg.findAll(n=>n.reactions&&n.reactions.length)){ for(const r of n.reactions) for(const a of (r.actions||[])){ total++; if(a.type==='NODE'&&!ids.has(a.destinationId)) broken++ } } for(const s of C.order){ const bs=s.findAll(x=>x.type==='INSTANCE'&&x.name==='Button'&&x.visible&&/variant=primary/.test(x.mainComponent.name)&&!/disabled|loading/.test(x.mainComponent.name)); if(bs.some(b=>!b.reactions||!b.reactions.length)) noPrimary.push(s.name) } return {total,broken,noPrimary} };
return C }

J.proto = async(...a)=>{ const C=await J.proto0(...a); C.errs={}; C.go=async(node,dest,kind)=>{ if(!node) return 0; const d=typeof dest==='string'?C.M[dest]:dest; if(kind!=='back'&&!d){ C.miss.push(String(dest)); return 0 } const act=kind==='back'?{type:'BACK'}:{type:'NODE',destinationId:d.id,navigation:kind==='over'?'OVERLAY':'NAVIGATE',transition:J.tr[kind||'push'],preserveScrollPosition:false}; try{ await node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[act]}]); C.links++; return 1 }catch(e){ const k=String(e&&e.message||e).slice(0,90); C.errs[k]=(C.errs[k]||0)+1; return 0 } }; return C }

window.jzMobile = async()=>{ const all=[0,1,3,2,4].flatMap(i=>J.base(i,'app')); const ovSrc={}; const picks=all.filter(f=>{ if(f.name==='التصفية'||f.name==='إذن الموقع'){ ovSrc[f.name]=f; return false } return true });
const C=await J.proto('▶ تجربة التطبيق',picks,12,120,'▶ تجربة التطبيق'); window.CM=C;
for(const k in ovSrc){ const o=C.overlay('نافذة: '+k,ovSrc[k],'Bottom sheet'); if(o){ o.resize(390,o.height) } }
const TABS={'الرئيسية':'الرئيسية','الخدمات':'الخدمات','الطلبات':'الطلبات','حسابي':'حسابي'};
for(const s of C.order){ for(const b of s.findAll(x=>x.name==='back'&&x.opacity>0&&x.visible)) await C.go(b,null,'back');
for(const tb of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Bottom tab bar')) for(const t of tb.findAll(x=>x.type==='TEXT'&&TABS[x.characters])) await C.go(t.parent,TABS[t.characters],'tab');
for(const h of s.findAll(x=>x.type==='INSTANCE'&&x.name==='App header')){ const a=h.findOne(x=>x.name==='actions'); if(a&&a.opacity>0){ const bag=a.findOne(x=>x.name==='shopping-bag'); if(bag) await C.go(bag,'السلة'); const bell=a.findOne(x=>/bell/.test(x.name)); if(bell) await C.go(bell.parent===a?bell:bell.parent,'مركز الإشعارات') } }
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Product card')) await C.go(c,'تفاصيل المنتج');
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Store card')) await C.go(c,'صفحة المتجر');
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Category tile')) await C.go(c,s.name==='الأقسام'?'نتائج البحث':'الأقسام');
if(s.name==='الرئيسية'||s.name==='الأقسام') for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Search bar')) await C.go(c,'البحث');
if(s.name==='نتائج البحث'||s.name==='البحث') for(const c of s.findAll(x=>x.name==='filter'&&x.visible)) await C.go(c,'نافذة: التصفية','over') }
for(const k of ['نافذة: التصفية','نافذة: إذن الموقع']){ const o=C.M[k]; if(o){ for(const b of o.findAll(x=>x.type==='INSTANCE'&&x.name==='Button')) await C.go(b,k.includes('التصفية')?'نتائج البحث':'إضافة عنوان على الخريطة','tab') } }
const L=[['التعريف: الشريحة الأولى','تخطي','رقم الجوال'],['التعريف: الشريحة الثانية','تخطي','رقم الجوال'],['تم الطلب','تتبع الطلب','تتبع الطلب'],['تم الطلب',/العودة/,'الرئيسية'],['العناوين',/إضافة عنوان/,'إضافة عنوان على الخريطة'],['تفاصيل الطلب',/إلغاء/,'سبب الإلغاء'],['تفاصيل الطلب',/مشكلة|شكوى/,'تقديم شكوى'],['تفاصيل الطلب',/تتبع/,'تتبع الطلب'],['البحث',/نعيمي|بقري|دجاج|غنم/,'نتائج البحث'],['تفاصيل الإعلان',/محادثة|تواصل|راسل|واتساب/,'المحادثة'],['الرئيسية',/التوصيل إلى/,'العناوين']];
for(const [s,t,d] of L) await C.txt(s,t,d);
await C.named('العناوين',/^ph\/pencil-simple$/,'تعديل العنوان'); await C.named('الطلبات',/order|card/i,'تفاصيل الطلب'); await C.named('سوق الأعلاف',/listing|card/i,'تفاصيل الإعلان'); await C.named('المحادثات',/row|thread|chat|item/i,'المحادثة'); await C.named('موسم الأضحى',/card|option|row|item/i,'يوم ذبح الأضحية'); await C.named('الشكاوى',/card|row|item/i,'حالة الشكوى'); await C.named('إعلاناتي',/card|row|item/i,'تفاصيل الإعلان'); await C.named('مواشيّ',/card|row|item/i,'تفاصيل الحيوان');
const SV={'ذبائح المناسبات':'طلب مناسبة: النوع','زيارة المزرعة':'حجز زيارة','اطبخها لي':'اطبخها لي','الأطباق الجاهزة':'الأطباق الجاهزة','سوق الأعلاف':'سوق الأعلاف','مواشيّ':'مواشيّ'}; const sv=C.M['الخدمات']; for(const t of sv.findAll(x=>x.name.startsWith('service/'))) await C.go(t,SV[t.name.slice(8)]); await C.go(sv.findOne(x=>x.name==='adha banner'),'موسم الأضحى'); await C.go(sv.findOne(x=>x.name==='chat row'),'المحادثات');
const AC={'طلباتي':'الطلبات','عناويني':'العناوين','مواشيّ':'مواشيّ','إعلاناتي في سوق الأعلاف':'إعلاناتي','الإشعارات':'مركز الإشعارات','الإعدادات':'الإعدادات','المساعدة والدعم':'التواصل مع الدعم'}; const ac=C.M['حسابي']; for(const t of ac.findAll(x=>x.name.startsWith('menu/'))) await C.go(t,AC[t.name.slice(5)]); await C.go(ac.findOne(x=>x.name==='logout'),'رقم الجوال'); await C.go(ac.findOne(x=>x.name==='edit'),'إكمال الملف الشخصي'); await C.txt('الإعدادات','تسجيل الخروج','رقم الجوال');
let fb=0; for(let i=0;i<C.order.length;i++){ const s=C.order[i]; const next=s.name==='إكمال الملف الشخصي'?C.M['الرئيسية']:(C.order[i+1]||C.M['الرئيسية']); for(const b of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Button'&&x.visible&&/variant=primary/.test(x.mainComponent.name)&&(!x.reactions||!x.reactions.length))) fb+=await C.go(b,next) }
for(const k of ['نافذة: التصفية','نافذة: إذن الموقع']){ const o=C.M[k]; if(o){ o.overlayPositionType='BOTTOM_CENTER'; o.overlayBackground={type:'SOLID_COLOR',color:{r:.1,g:.04,b:.05,a:.55}}; o.overlayBackgroundInteraction='CLOSE_ON_CLICK_OUTSIDE' } }
C.pg.flowStartingPoints=[{nodeId:C.M['التعريف: الشريحة الأولى'].id,name:'تجربة التطبيق'}]; const a=C.audit(); figma.viewport.scrollAndZoomIntoView(C.order);
return 'screens '+C.order.length+' links '+a.total+' broken '+a.broken+' fallback '+fb+' noPrimary '+a.noPrimary.length+' miss: '+C.miss.join(' , ')+' errs '+JSON.stringify(C.errs) }

window.jzWeb = async()=>{ const picks=[1,0,3,2,4,5].flatMap(i=>J.base(i,'web')); const C=await J.proto('▶ تجربة الويب',picks,5,160,'▶ تجربة الويب'); window.CW=C; const svc=J.base(3,'web')[0]?J.base(3,'web')[0].name:'الرئيسية'; const vend=J.base(5,'web')[0]?J.base(5,'web')[0].name:null;
const HL={'link/home':'الرئيسية','link/stores':'صفحة المتجر','link/services':svc,'link/account':'الإعدادات','logo':'الرئيسية','cart':'السلة','notifications':'مركز الإشعارات','search':'نتائج البحث','location':'العناوين'};
const AN={'item/profile':'إكمال الملف الشخصي','item/orders':'تفاصيل الطلب','item/addresses':'العناوين','item/notifications':'مركز الإشعارات','item/settings':'الإعدادات','item/support':'التواصل مع الدعم','item/logout':'رقم الجوال'};
for(const s of C.order){ for(const h of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Web header')) for(const k in HL){ const n=h.findOne(x=>x.name===k); if(n) await C.go(n,HL[k],'web') }
for(const h of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Account nav')) for(const k in AN){ const n=h.findOne(x=>x.name===k); if(n) await C.go(n,AN[k],'web') }
for(const h of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Web footer'&&x.visible)){ for(const t of h.findAll(x=>x.type==='TEXT')){ const d={'انضم كتاجر':vend,'تتبّع طلبك':'تفاصيل الطلب','مركز المساعدة':'التواصل مع الدعم','تواصل معنا':'التواصل مع الدعم','الإلغاء والاسترجاع':'الاسترداد'}[t.characters]; if(d) await C.go(t,d,'web') } }
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Product card')) await C.go(c,'تفاصيل المنتج','web');
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Store card')) await C.go(c,'صفحة المتجر','web');
for(const c of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Category tile')) await C.go(c,'الأقسام','web') }
const L=[['تفاصيل المنتج',/أضف إلى السلة/,'السلة'],['السلة',/متابعة|الدفع/,'الدفع: الاستلام واليوم'],['تم الطلب',/تتبع/,'تفاصيل الطلب'],['تم الطلب',/العودة|الرئيسية/,'الرئيسية'],['تفاصيل الطلب',/إلغاء/,'الاسترداد'],['تفاصيل الطلب',/مشكلة|شكوى/,'تقديم شكوى'],['العناوين',/إضافة عنوان/,'إضافة وتعديل العنوان'],['الإعدادات','تسجيل الخروج','رقم الجوال']]; for(const [s,t,d] of L) await C.txt(s,t,d,'web');
let fb=0; for(let i=0;i<C.order.length;i++){ const s=C.order[i]; const next=s.name==='إكمال الملف الشخصي'?C.M['الرئيسية']:(C.order[i+1]||C.M['الرئيسية']); for(const b of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Button'&&x.visible&&/variant=primary/.test(x.mainComponent.name)&&(!x.reactions||!x.reactions.length))) fb+=await C.go(b,next,'web') }
C.pg.flowStartingPoints=[{nodeId:C.M['الرئيسية'].id,name:'تجربة الويب'}]; const a=C.audit(); figma.viewport.scrollAndZoomIntoView(C.order); return 'web screens '+C.order.length+' links '+a.total+' broken '+a.broken+' fallback '+fb+' noPrimary '+a.noPrimary.join('،')+' errs '+Object.keys(C.errs).length }

window.jzDash = async()=>{ const login=J.base(0,'dash'); const role=f=>{ const sn=f.findOne(x=>x.type==='INSTANCE'&&x.name==='Side nav'); return sn?sn.mainComponent.name.replace('role=',''):'none' }; const dash=[6,5,1,2,3,4].flatMap(i=>J.base(i,'dash')); const by={admin:[],vendor:[],kitchen:[]}; dash.forEach(f=>{ const r=role(f); if(by[r]) by[r].push(f) });
const picks=[...login,...by.admin,...login,...by.vendor,...by.kitchen]; const C=await J.proto('▶ تجربة لوحة التحكم',picks,5,160,'▶ تجربة لوحة التحكم'); window.CD=C; const nL=login.length, nA=by.admin.length, nV=by.vendor.length;
const grp={admin:C.order.slice(nL,nL+nA),vendor:C.order.slice(nL*2+nA,nL*2+nA+nV),kitchen:C.order.slice(nL*2+nA+nV)}; const l1=C.order.slice(0,nL), l2=C.order.slice(nL+nA,nL*2+nA); l2.forEach(f=>f.name=f.name.replace('الإدارة','البائع').replace(' ٢',''));
const alias={'لوحة المعلومات':'نظرة عامة','الرئيسية':'نظرة عامة'}; let navOk=0, navMiss={};
for(const r in grp){ const list=grp[r]; for(const s of list){ for(const ni of s.findAll(x=>x.type==='INSTANCE'&&x.name==='Nav item')){ const t=ni.findOne(x=>x.type==='TEXT'); if(!t) continue; const lab=alias[t.characters]||t.characters; const w=lab.replace(/^ال/,''); let d=list.find(f=>f.name===lab)||list.find(f=>f.name.includes(lab))||list.find(f=>f.name.includes(w))||list.find(f=>lab.includes(f.name)); if(/تسجيل الخروج/.test(lab)) d=(r==='admin'?l1:l2)[0]; if(d){ navOk+=await C.go(ni,d,'web') } else navMiss[r+':'+lab]=1 }
for(const t of s.findAll(x=>x.type==='TEXT'&&x.characters==='تسجيل الخروج')) await C.go(t.parent,(r==='admin'?l1:l2)[0],'web') } }
for(const [ls,target] of [[l1,grp.admin.find(f=>f.name==='نظرة عامة')||grp.admin[0]],[l2,grp.vendor[0]]]){ for(let i=0;i<ls.length;i++){ for(const b of ls[i].findAll(x=>x.type==='INSTANCE'&&x.name==='Button')) await C.go(b,ls[i+1]||target,'web') } }
let fb=0; for(const r in grp){ const list=grp[r]; for(let i=0;i<list.length;i++){ for(const b of list[i].findAll(x=>x.type==='INSTANCE'&&x.name==='Button'&&x.visible&&/variant=primary/.test(x.mainComponent.name)&&(!x.reactions||!x.reactions.length))) fb+=await C.go(b,list[i+1]||list[0],'web') } }
C.pg.flowStartingPoints=[{nodeId:l1[0].id,name:'لوحة الإدارة'},{nodeId:l2[0].id,name:'لوحة البائع'}].concat(grp.kitchen[0]?[{nodeId:grp.kitchen[0].id,name:'لوحة المطبخ'}]:[]); const a=C.audit(); figma.viewport.scrollAndZoomIntoView(C.order);
return 'dash screens '+C.order.length+' (admin '+nA+' vendor '+nV+' kitchen '+grp.kitchen.length+') links '+a.total+' broken '+a.broken+' nav '+navOk+' fallback '+fb+' navMiss '+Object.keys(navMiss).join(' , ')+' errs '+Object.keys(C.errs).length }
