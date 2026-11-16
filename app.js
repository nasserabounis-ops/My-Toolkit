(function(){
'use strict';
const M=window.MODEL,E=Engine(M);
const LS='advtk.v1',LSS='advtk.scn';
const $=s=>document.querySelector(s);
let st={ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1'},scn={};
try{const x=JSON.parse(localStorage.getItem(LS)||'null');if(x)st=Object.assign(st,x);}catch(e){}
try{scn=JSON.parse(localStorage.getItem(LSS)||'{}')||{};}catch(e){}
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(LS,JSON.stringify(st));localStorage.setItem(LSS,JSON.stringify(scn));}catch(e){}},250);}
function saveNow(){try{localStorage.setItem(LS,JSON.stringify(st));localStorage.setItem(LSS,JSON.stringify(scn));}catch(e){}}
if(!st.prof)st.prof={'Rig 1':{}};if(!st.rig||!st.prof[st.rig])st.rig=Object.keys(st.prof)[0]||(st.prof['Rig 1']={},'Rig 1');
const PER=['WCE Audit','Equipment Register','Job Tickets','Visit Checklist','Visit Report'];
function getOv(sheet,create){
  if(PER.includes(sheet)){const p=(st.prof[st.rig]=st.prof[st.rig]||{});if(create&&!p[sheet])p[sheet]={};return p[sheet];}
  if(create&&!st.ov[sheet])st.ov[sheet]={};return st.ov[sheet];
}
function setOv(sheet,obj){
  if(PER.includes(sheet)){const p=(st.prof[st.rig]=st.prof[st.rig]||{});if(obj===undefined)delete p[sheet];else p[sheet]=obj;}
  else{if(obj===undefined)delete st.ov[sheet];else st.ov[sheet]=obj;}
}
function combined(){const c=Object.assign({},st.ov);const p=st.prof[st.rig]||{};PER.forEach(x=>{c[x]=p[x]||{};});return c;}
function apply(){E.setOverrides(combined());}
apply();
const meta={};M.cats.forEach(c=>c.sheets.forEach(s=>meta[s.name]={cat:c.name,color:c.color,what:s.what,use:s.use}));
const app=$('#app'),back=$('#back'),ttl=$('#ttl'),pinB=$('#pin'),menuB=$('#menu'),pop=$('#sheetmenu');
let cur=null,calcs=[],deferred=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;});
function toast(t){const x=$('#toast');x.textContent=t;x.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>x.hidden=true,2400);}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const colorOf=n=>(meta[n]||{}).color||'1F3864';
// ---------- routing ----------
function route(){
  pop.hidden=true;
  const h=decodeURIComponent(location.hash||'');
  const m=h.match(/^#\/s\/(.+)$/);
  if(m&&M.sheets[m[1]])openSheet(m[1]);else home();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
let wasNarrow=innerWidth<=760;
window.addEventListener('resize',()=>{const n=innerWidth<=760;if(n!==wasNarrow){wasNarrow=n;if(cur)openSheet(cur,true);}});
back.onclick=()=>{location.hash='';};
// ---------- home ----------
function tile(sh,color){
  const a=el('a','tile');a.href='#/s/'+encodeURIComponent(sh.name);a.style.borderLeftColor='#'+color;
  a.append(el('b','',sh.name),el('span','',sh.what));return a;
}
function home(){
  cur=null;calcs=[];back.hidden=true;pinB.hidden=true;ttl.textContent='Advisor Toolkit';
  app.innerHTML='';
  const hero=el('div','hero');hero.innerHTML='<b>Drilling, Completion &amp; Workover Toolkit</b><span>Eng: Nasser Aboyounes &middot; calculators and libraries &middot; works offline</span>';
  app.append(hero);
  const q=el('input','search');q.type='search';q.placeholder='Find a calculator or library...';q.setAttribute('aria-label','Search');app.append(q);
  const holder=el('div');app.append(holder);
  const draw=()=>{
    holder.innerHTML='';const t=q.value.trim().toLowerCase();
    const all=[];M.cats.forEach(c=>c.sheets.forEach(s=>all.push([s,c])));
    if(t){
      const hit=all.filter(([s,c])=>(s.name+' '+s.what+' '+s.use+' '+c.name).toLowerCase().includes(t));
      holder.append(el('h2','sec',hit.length+' found'));
      const g=el('div','tiles');hit.forEach(([s,c])=>g.append(tile(s,c.color)));holder.append(g);return;
    }
    if(st.pins.length){holder.append(el('h2','sec','Pinned'));const d=el('div','chips');st.pins.filter(n=>M.sheets[n]).forEach(n=>{const a=el('a','chip',n);a.href='#/s/'+encodeURIComponent(n);a.style.borderColor='#'+colorOf(n);d.append(a);});holder.append(d);}
    const rec=(st.recent||[]).filter(n=>M.sheets[n]&&!st.pins.includes(n)).slice(0,4);
    if(rec.length){holder.append(el('h2','sec','Recent'));const d=el('div','chips');rec.forEach(n=>{const a=el('a','chip',n);a.href='#/s/'+encodeURIComponent(n);d.append(a);});holder.append(d);}
    holder.append(el('h2','sec','All tools'));
    M.cats.forEach((c,i)=>{
      const d=el('details','cat');d.open=i<2;
      const s=el('summary');s.style.background='#'+c.color;
      const w=el('div');w.append(el('div','',c.name),el('small','',c.desc));s.append(w,el('span','n',String(c.sheets.length)));
      d.append(s);const g=el('div','tiles');c.sheets.forEach(sh=>g.append(tile(sh,c.color)));d.append(g);holder.append(d);
    });
    holder.append(el('p','note','Yellow cells are inputs; green cells calculate. Values you type are saved on this device only. The audit, equipment, tickets, checklist and visit report are kept per rig (switch rig at the top of those sheets).'));
    holder.append(el('div','ver','Advisor Toolkit app - the calculators are screening aids; the approved program and company procedures take priority.'));
  };
  q.oninput=draw;draw();
}
// ---------- sheet ----------
const px=(w,i,narrow)=>{let p=Math.round((w||8.43)*7+8);if(narrow)p=Math.min(p,i===1?130:150);else p=Math.min(p,560);return Math.max(p,28);};
function resolveList(sheet,f1){
  if(!f1)return[];
  if(f1[0]==='"')return f1.slice(1,-1).split(',');
  const m=f1.replace(/\$/g,'').match(/^(?:'?([^'!]+)'?!)?([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if(!m)return[];const sh=m[1]||sheet;const cn=s=>{let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n;};
  const out=[];const c0=cn(m[2]),r0=+m[3],c1=m[4]?cn(m[4]):c0,r1=m[5]?+m[5]:r0;
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const v=E.value(sh,r,c);if(v!==null&&v!=='')out.push(String(v));}
  return[...new Set(out)];
}
function fmtVal(v,nf){
  if(v===null||v===undefined)return'';
  if(typeof v==='object'&&'err' in v)return v.err;
  if(typeof v==='number'){if(nf)return Engine.fmtNum(v,nf);return String(Number(v.toPrecision(10)));}
  if(typeof v==='boolean')return v?'TRUE':'FALSE';
  return String(v);
}
function setCalc(o){
  const v=E.value(o.sheet,o.r,o.c);const e=o.el;
  const t=fmtVal(v,o.nf);
  if(e.dataset.t!==t){e.firstChild?e.firstChild.nodeValue=t:e.append(document.createTextNode(t));e.dataset.t=t;}
  e.classList.remove('err','num');
  if(typeof v==='number')e.classList.add('num');
  else if(v&&typeof v==='object'&&'err' in v)e.classList.add('err');
}
let cells=new Map(),cfT=[];
function refresh(){calcs.forEach(setCalc);applyCF();}
function applyCF(){
  if(!cfT.length)return;
  const hit=new Map();
  for(const rule of cfT){
    for(const g of rule.rg)for(let r=g[0];r<=g[2];r++)for(let c=g[1];c<=g[3];c++){
      const k=r+','+c;const e=cells.get(k);if(!e)continue;
      let h=hit.get(k);if(!h){h={};hit.set(k,h);}
      if(h.bg!==undefined&&h.fg!==undefined)continue;
      if(!E.cf(cur,rule,r,c))continue;
      if(rule.bg&&h.bg===undefined)h.bg=rule.bg;if(rule.fg&&h.fg===undefined)h.fg=rule.fg;if(rule.b&&h.b===undefined)h.b=1;
      if(h.bg===undefined)h.bg=null;if(h.fg===undefined)h.fg=null;
    }
  }
  cells.forEach((e,k)=>{
    if(!e._cf)return;const h=hit.get(k)||{};
    e.style.background=h.bg?'#'+h.bg:e._base.bg;e.style.color=h.fg?'#'+h.fg:e._base.fg;e.style.fontWeight=h.b?'700':e._base.fw;
  });
}
function openSheet(name,keepScroll){
  cur=name;calcs=[];cells=new Map();cfT=(M.sheets[name].cf||[]);const sh=M.sheets[name];const narrow=innerWidth<=760;
  back.hidden=false;pinB.hidden=false;ttl.textContent=name;pinB.textContent=st.pins.includes(name)?'★':'☆';
  st.recent=[name].concat((st.recent||[]).filter(n=>n!==name)).slice(0,8);save();
  app.innerHTML='';
  const hd=el('div','');hd.style.cssText='display:flex;gap:8px;align-items:center;margin:0 2px 8px;font-size:12.5px;color:var(--mut)';
  const dot=el('span');dot.style.cssText='width:10px;height:10px;border-radius:50%;background:#'+colorOf(name);hd.append(dot,el('span','',(meta[name]||{}).cat||''));app.append(hd);
  if(PER.includes(name))app.append(rigBar());
  const box=el('div','sheet');
  const widths=[];for(let i=1;i<=sh.cols;i++)widths[i]=px(sh.widths[i],i,narrow);
  if(narrow){const avail=innerWidth-30;let tot=widths.slice(1).reduce((x,y)=>x+y,0);if(sh.cols<=4&&tot>avail){const k=avail/tot;for(let i=1;i<=sh.cols;i++)widths[i]=Math.max(62,Math.floor(widths[i]*k));}}
  const tpl=widths.slice(1).map(w=>w+'px').join(' ');
  const totalW=widths.slice(1).reduce((a,b)=>a+b,0);
  const rows=new Map();sh.cells.forEach(c=>{if(!rows.has(c[0]))rows.set(c[0],[]);rows.get(c[0]).push(c);});
  const rkeys=[...rows.keys()].sort((a,b)=>a-b);
  let wrap=null;
  const nBlank=c=>c[2]===null&&!c[3]&&M.styles[c[4]][0]!=='FFF2CC';
  let wideRows=0;for(const rk of rkeys){if(rows.get(rk).filter(c=>!nBlank(c)).length>=5)wideRows++;}
  const tableSheet=wideRows/rkeys.length>=0.3;
  for(const rk of rkeys){
    let cs=rows.get(rk).sort((a,b)=>a[1]-b[1]).map(c=>c.slice());
    {const cc=cs.filter(c=>!nBlank(c)).map(c=>c[1]);
     for(const c of cs){if(typeof c[2]==='string'&&!c[3]&&c[5]===1&&c[2].length>6&&M.styles[c[4]][0]!=='FFF2CC'){const nx=cc.find(x=>x>c[1]);const end=nx||(sh.cols+1);if(end-c[1]>1)c[5]=end-c[1];}}
     cs=cs.filter(c=>!(nBlank(c)&&cs.some(d=>d!==c&&d[1]<c[1]&&d[1]+d[5]>c[1])));}
    const hasHdr=cs.some(c=>M.styles[c[4]][0]==='1F3864');
    const first=cs.find(c=>c[1]===1);
    const firstTxt=first&&typeof first[2]==='string'&&!first[3]?first[2]:(first&&first[3]&&typeof first[7]==='string'?first[7]:'');
    const isBlank=c=>c[2]===null&&!c[3]&&M.styles[c[4]][0]!=='FFF2CC';
    const content=cs.filter(c=>!isBlank(c));
    const maxc=Math.max(...content.map(c=>c[1]),1);
    const stack=(tableSheet?(content.length<=2&&!hasHdr&&(rk<=3||(firstTxt.length>=14)||content.some(c=>typeof c[7]==='string'&&c[7].length>30))):content.length<=4)&&!hasHdr&&maxc<=6&&(rk<=3||(firstTxt!==''&&isNaN(Number(firstTxt)))||content.every(c=>typeof c[2]==='string'||c[2]===null));
    const row=el('div','row'+(stack?' stack':'')+(rk===1?' title':''));
    row.style.gridTemplateColumns=tpl;row.style.setProperty('--w',totalW+'px');
    cs.forEach(c=>{const x=mkCell(name,c,stack);if(stack&&isBlank(c))x.classList.add('blank');row.append(x);});
    if(stack){wrap=null;box.append(row);}
    else{if(!wrap){wrap=el('div','tblwrap');box.append(wrap);}wrap.append(row);}
  }
  if(name==='TCP Correlation'){const f=el('div','fig');const im=new Image();im.src='img/tcp_sketch.png';im.alt='Wellhead and TCP string sketch';f.append(im);box.append(f);}
  app.append(box);
  refresh();
  if(keepScroll)return;
}
function mkCell(sheet,c,stack){
  const [r,col,val,isF,si,span,dv,cached]=c;const s=M.styles[si];
  const e=el('div','c');e.style.gridColumn=col+' / span '+span;
  if(s[0])e.style.background='#'+s[0];if(s[1])e.style.color='#'+s[1];
  if(s[2])e.style.fontWeight='700';if(s[3])e.style.fontStyle='italic';
  if(s[4]&&s[4]>11)e.style.fontSize=Math.round(s[4]*1.15)+'px';
  if(s[5]==='center'){e.classList.add('ctr');}else if(s[5]==='right')e.classList.add('num');
  if(!s[7]&&!s[0])e.classList.add('nob');
  if(!s[0]&&col===1)e.style.background='#fff';
  const isInput=!isF&&s[0]==='FFF2CC';
  if(isInput){
    const key=r+','+col;
    const o=getOv(sheet);const has=o&&key in o;
    const cur0=has?o[key]:val;
    if(dv){
      const sel=document.createElement('select');const items=resolveList(sheet,dv);
      const blank=document.createElement('option');blank.value='';blank.textContent='';sel.append(blank);
      items.forEach(it=>{const op=document.createElement('option');op.value=it;op.textContent=it;sel.append(op);});
      sel.value=cur0===null||cur0===undefined?'':String(cur0);
      sel.onchange=()=>setInput(sheet,r,col,sel.value,false);
      e.append(sel);
    }else{
      const isDate=s[6]&&/mmm|yy/.test(s[6]);
      if(isDate){
        const inp=document.createElement('input');inp.type='date';
        const iso=x=>(typeof x==='number'&&x>0)?new Date(Date.UTC(1899,11,30)+Math.round(x)*864e5).toISOString().slice(0,10):'';
        inp.value=iso(cur0);inp.setAttribute('aria-label',sheet+' R'+r+'C'+col);
        inp.addEventListener('input',()=>{const t=inp.value;let sv='';if(t){const [y,m,d]=t.split('-').map(Number);sv=Math.round((Date.UTC(y,m-1,d)-Date.UTC(1899,11,30))/864e5);}setInput(sheet,r,col,sv,false);});
        e.append(inp);if(stack)e.classList.add('val');
        e._base=null;
      }else{
      const inp=document.createElement('input');const numeric=(typeof val==='number')||(s[6]&&val===null);
      inp.type='text';if(numeric){inp.inputMode='decimal';e.classList.add('num');}
      inp.value=cur0===null||cur0===undefined?'':String(cur0);inp.setAttribute('aria-label',sheet+' R'+r+'C'+col);
      inp.addEventListener('input',()=>setInput(sheet,r,col,inp.value,numeric));
      inp.addEventListener('focus',()=>inp.select());
      e.append(inp);
      }
    }
    if(stack)e.classList.add('val');
  }else if(isF){
    const o={el:e,sheet,r,c:col,nf:s[6]};calcs.push(o);
    e.append(document.createTextNode(''));
    if(stack){e.classList.add(typeof cached==='string'&&cached.length>14?'span':'val');}
  }else{
    const t=val===null?'':(typeof val==='number'?(s[6]?Engine.fmtNum(val,s[6]):String(val)):String(val));
    e.append(document.createTextNode(t));
    if(typeof val==='number')e.classList.add('num');
    if(stack){e.classList.add(col===1?'lab':(span>1||t.length>24)?'txt':'unit');}
  }
  e._base={bg:e.style.background,fg:e.style.color,fw:e.style.fontWeight};e._cf=cfT.length>0;cells.set(r+','+col,e);
  return e;
}
function setInput(sheet,r,col,raw,numeric){
  const key=r+','+col;let v=raw;
  if(numeric){const t=String(raw).trim().replace(/,/g,'.');if(t===''){v='';}else if(!isNaN(Number(t)))v=Number(t);}
  getOv(sheet,true)[key]=v;
  apply();refresh();save();
}
// ---------- rig profiles ----------
function rigBar(){
  const b=el('div','rigbar');b.append(el('span','',"Rig / well:"));
  const sel=document.createElement('select');Object.keys(st.prof).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.append(o);});sel.value=st.rig;
  sel.onchange=()=>{st.rig=sel.value;apply();saveNow();openSheet(cur);};
  const mk=(t,fn)=>{const x=el('button','btn alt sm',t);x.onclick=fn;return x;};
  b.append(sel,
    mk('+ New',()=>{const n=prompt('Name of the new rig (for example: Rig 07)');if(!n||st.prof[n])return;st.prof[n]={};st.rig=n;apply();saveNow();openSheet(cur);}),
    mk('Rename',()=>{const n=prompt('New name for '+st.rig,st.rig);if(!n||n===st.rig||st.prof[n])return;st.prof[n]=st.prof[st.rig];delete st.prof[st.rig];st.rig=n;apply();saveNow();openSheet(cur);}),
    mk('Delete',()=>{if(Object.keys(st.prof).length<2){toast('Keep at least one rig');return;}if(confirm('Delete all audit and visit data for '+st.rig+'?')){delete st.prof[st.rig];st.rig=Object.keys(st.prof)[0];apply();saveNow();openSheet(cur);}}));
  const n=el('div','rignote','Audit, equipment, tickets, checklist and visit report are kept separately for each rig. Switch rig here.');
  const w=el('div');w.append(b,n);return w;
}
// ---------- menu ----------
pinB.onclick=()=>{if(!cur)return;const i=st.pins.indexOf(cur);if(i>=0)st.pins.splice(i,1);else st.pins.push(cur);pinB.textContent=st.pins.includes(cur)?'★':'☆';save();toast(i>=0?'Unpinned':'Pinned to the home page');};
function item(txt,fn,cls){const b=el('button',cls||'',txt);b.onclick=()=>{pop.hidden=true;fn();};return b;}
menuB.onclick=(ev)=>{
  ev.stopPropagation();
  if(!pop.hidden){pop.hidden=true;return;}
  pop.innerHTML='';
  if(cur){
    pop.append(el('div','h',cur));
    pop.append(item('Reset this sheet to the example values',()=>{setOv(cur,undefined);apply();saveNow();openSheet(cur);toast('Reset');}));
    pop.append(item('Save these inputs as a scenario...',saveScenario));
    pop.append(item('Load or delete a scenario',loadScenario));
    pop.append(item('Print this sheet',()=>window.print()));
  }
  pop.append(el('div','h','App'));
  pop.append(item('Install on this device',install));
  pop.append(item('Back up my data (download file)',exportData));
  pop.append(item('Restore a backup file',importData));
  pop.append(item('Erase all saved inputs on this device',()=>{if(confirm('Erase every saved input, pin and scenario on this device?')){st={ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1'};scn={};apply();saveNow();route();toast('Erased');}}));
  pop.hidden=false;
};
document.addEventListener('click',e=>{if(!pop.hidden&&!pop.contains(e.target)&&e.target!==menuB)pop.hidden=true;});
function install(){
  if(deferred){deferred.prompt();deferred=null;return;}
  pop.innerHTML='';pop.append(el('div','h','Install'));
  const p=el('div','');p.style.cssText='padding:12px 16px;font-size:14px';
  p.innerHTML='<b>iPhone / iPad (Safari):</b> Share, then Add to Home Screen.<br><b>Android (Chrome):</b> menu, then Install app or Add to Home screen.<br><b>Laptop (Chrome / Edge):</b> the install icon at the right of the address bar.<br><br>Install only works from the https address where the files are hosted.';
  pop.append(p);pop.hidden=false;
}
function saveScenario(){
  const name=prompt('Scenario name (for example: Well A kill sheet)');if(!name)return;
  (scn[cur]=scn[cur]||{})[name]=JSON.parse(JSON.stringify(getOv(cur)||{}));saveNow();toast('Saved scenario: '+name);
}
function loadScenario(){
  const list=scn[cur]||{};const names=Object.keys(list);
  pop.innerHTML='';pop.append(el('div','h','Scenarios for '+cur));
  if(!names.length){const p=el('div','','No scenarios saved for this sheet yet.');p.style.cssText='padding:12px 16px;font-size:14px';pop.append(p);}
  names.forEach(n=>{
    const d=el('div','row2');
    const b=el('button','',n);b.onclick=()=>{setOv(cur,JSON.parse(JSON.stringify(list[n])));apply();saveNow();pop.hidden=true;openSheet(cur);toast('Loaded: '+n);};
    const x=el('button','x','×');x.onclick=()=>{if(confirm('Delete scenario '+n+'?')){delete list[n];saveNow();loadScenario();}};
    d.append(b,x);pop.append(d);
  });
  pop.hidden=false;
}
function exportData(){
  const blob=new Blob([JSON.stringify({app:'advisor-toolkit',v:1,st,scn},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='advisor-toolkit-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();toast('Backup downloaded');
}
function importData(){
  const i=document.createElement('input');i.type='file';i.accept='application/json,.json';
  i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.app!=='advisor-toolkit')throw 0;st=Object.assign({ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1'},d.st);if(!st.prof[st.rig])st.rig=Object.keys(st.prof)[0];scn=d.scn||{};apply();saveNow();route();toast('Backup restored');}catch(e){toast('That file is not a toolkit backup');}};r.readAsText(f);};
  i.click();
}
window.addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNow();});
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
route();
})();
