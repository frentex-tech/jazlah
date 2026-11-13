// DSN-DES-2 (#204), 2026-11-13: regroup the design pages by platform. Run after 90-DSN-DES-2-client-ready.js (needs J).
// Result: three design pages, "01 التطبيق" (app), "02 الويب" (web), "03 لوحات التحكم" (dashboards, grouped by role).
// Inside a page the screens are grouped by product area (dashboards: by role) and every state sits in the "الحالات" section.
// It ran once on the file that still had the seven area pages: each screen got its area (0 to 6) and, for dashboards,
// its role as shared plugin data ("area", "role") in a step before this one. On the regrouped file use it only to re-lay
// the three pages out (it finds them by the "0N " name prefix). It replaces jzLayout from script 90.
// Note: jzMobile/jzWeb/jzDash in script 90 still read the old page indexes through J.base and need J.base updated
// (all main screens of a row, sorted by area then ord) before the prototype pages are rebuilt.
window.jzAreas = ['الحساب والدخول','المتجر والطلب','المواعيد والزيارة','المناسبات والأضاحي','الأعلاف والمحادثة','البائع','الإدارة']
const J=window.J; const NS=J.NS; const AREAS=window.jzAreas;
window.jzPlatform=async()=>{ const old=figma.root.children.filter(p=>/^0[1-7] /.test(p.name)); const isScr=c=>(c.type==='FRAME'||c.type==='COMPONENT')&&J.g(c,'row'); const frames=old.flatMap(p=>[...p.children,...p.children.filter(x=>x.type==='SECTION').flatMap(s=>s.children)].filter(isScr));
 const T=[['app','01 التطبيق',14,100],['web','02 الويب',6,120],['dash','03 لوحات التحكم',6,120]]; const targets=T.map((t,i)=>old[i]);
 for(const f of frames){ const ti=T.findIndex(t=>t[0]===J.g(f,'row')); if(f.parent!==targets[ti]) targets[ti].appendChild(f) }
 for(const p of old){ for(const c of [...p.children]){ if(c.type==='SECTION'||J.g(c,'jz')==='title') c.remove() } }
 for(const p of old.slice(3)){ if(p.children.length===0){ if(figma.currentPage===p) await figma.setCurrentPageAsync(old[0]); p.remove() } }
 const EM={family:'El Messiri',style:'Bold'}, RX={family:'Readex Pro',style:'Regular'}; const mk=(parent,str,size,font,hex)=>{ const t=figma.createText(); t.fontName=font; t.fontSize=size; t.characters=str; t.fills=[J.p(hex)]; t.textAlignHorizontal='RIGHT'; t.setSharedPluginData(NS,'jz','title'); t.name=str; parent.appendChild(t); return t };
 const ROLE={admin:'لوحة الإدارة',vendor:'لوحة البائع',kitchen:'لوحة المطبخ'}; const res=[];
 for(let ti=0;ti<3;ti++){ const [row,name,per,gap]=T[ti]; const p=targets[ti]; p.name=name; p.backgrounds=[J.p('#171011')]; await figma.setCurrentPageAsync(p); const mine=p.children.filter(isScr); const ord=f=>(+J.g(f,'area'))*100000+(+(J.g(f,'ord')||9999));
  const gkey=f=>row==='dash'?J.g(f,'role'):J.g(f,'area'); const gorder=row==='dash'?['admin','vendor','kitchen']:['0','1','2','3','4','5','6']; const gtitle=k=>row==='dash'?ROLE[k]:AREAS[+k];
  const block=(pick,tsize)=>{ const out=[]; let y=0,W=0; for(const k of gorder){ const list=mine.filter(f=>gkey(f)===k&&pick(f)); if(!list.length) continue; const baseOrd={}; mine.filter(f=>gkey(f)===k&&!f.name.includes(' · ')).forEach(f=>baseOrd[J.g(f,'area')+f.name]=ord(f)); const bo=f=>baseOrd[J.g(f,'area')+f.name.split(' · ')[0]]??ord(f); list.sort((a,b)=>(bo(a)-bo(b))||(ord(a)-ord(b))); out.push({title:gtitle(k),sub:list.length+' شاشة',y,tsize}); y+=tsize*2.3; for(let i=0;i<list.length;i+=per){ const line=list.slice(i,i+per); let rx=0,h=0; for(const f of line){ out.push({f,rx,y}); rx+=f.width+gap; h=Math.max(h,f.height) } W=Math.max(W,rx-gap); y+=h+180 } y+=360 } return {out,W,H:Math.max(0,y-540)} };
  const put=(B,parent,rightX,y0)=>{ for(const o of B.out){ if(o.f){ if(o.f.parent!==parent) parent.appendChild(o.f); o.f.x=rightX-o.rx-o.f.width; o.f.y=y0+o.y } else { const t=mk(parent,o.title,o.tsize,EM,'#D9AE62'); t.x=rightX-t.width; t.y=y0+o.y; const s=mk(parent,o.sub,44,RX,'#B9A79F'); s.x=rightX-t.width-40-s.width; s.y=y0+o.y+o.tsize*0.7 } } };
  const A=block(f=>!f.name.includes(' · '),130), S=block(f=>f.name.includes(' · '),100); put(A,p,0,0);
  const h=mk(p,name,240,EM,'#D9AE62'); h.x=-h.width; h.y=-700; const nb=A.out.filter(o=>o.f).length, ns=S.out.filter(o=>o.f).length; const hs=mk(p,'جزلة · تصميم المنتج — '+nb+' شاشة أساسية · '+ns+' حالة · مرتّبة حسب '+(row==='dash'?'الدور':'القسم'),56,RX,'#B9A79F'); hs.x=-hs.width; hs.y=-340;
  if(ns){ const sec=figma.createSection(); sec.setSharedPluginData(NS,'jz','states'); p.appendChild(sec); sec.name='الحالات — تحميل · خطأ · فارغة · معبّأة'; sec.fills=[J.p('#231819')]; const pad=240; sec.resizeWithoutConstraints(S.W+pad*2,S.H+pad*2+100); sec.x=-(S.W+pad*2)+pad; sec.y=A.H+900; put(S,sec,pad+S.W,pad) }
  res.push(name+' base '+nb+' states '+ns+' W '+Math.round(Math.max(A.W,S.W))+' H '+Math.round(A.H)) }
 J.all=(pred)=>figma.root.children.slice(0,3).flatMap(p=>[...p.children,...p.children.filter(x=>x.type==='SECTION').flatMap(s=>s.children)]).filter(c=>(c.type==='FRAME'||c.type==='COMPONENT')&&J.g(c,'row')&&(!pred||pred(c)));
 return res.join('\n')+'\npages: '+figma.root.children.map(p=>p.name+' '+p.id).join(' | ') }; await window.jzPlatform()
