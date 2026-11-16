(function(){
'use strict';
const M=window.MODEL,E=Engine(M),S=M.styles;
const LS='advtk.v1',LSS='advtk.scn';
const $=s=>document.querySelector(s);
let st={ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1',theme:'auto'},scn={};
try{const x=JSON.parse(localStorage.getItem(LS)||'null');if(x)st=Object.assign(st,x);}catch(e){}
try{scn=JSON.parse(localStorage.getItem(LSS)||'{}')||{};}catch(e){}
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,250);}
function saveNow(){try{localStorage.setItem(LS,JSON.stringify(st));localStorage.setItem(LSS,JSON.stringify(scn));}catch(e){}}
if(!st.prof)st.prof={'Rig 1':{}};
if(!st.rig||!st.prof[st.rig])st.rig=Object.keys(st.prof)[0]||(st.prof['Rig 1']={},'Rig 1');
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

/* ---------- helpers ---------- */
const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined&&txt!==null)e.textContent=txt;return e;};
const hh=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.innerHTML=html;return e;};
const IC={
home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
chev:'<path d="m9 6 6 6-6 6"/>',chevd:'<path d="m6 9 6 6 6-6"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
print:'<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
save:'<path d="M6 3h12v18l-6-4-6 4z"/>',
download:'<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 20h16"/>',
upload:'<path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 20h16"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
auto:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor"/>',
shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
droplet:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".5"/>',
pipe:'<rect x="9" y="3" width="6" height="18" rx="1.2"/><path d="M9 8h6M9 13h6M9 18h6"/>',
hook:'<path d="M12 3v10a4 4 0 1 1-4-4"/><path d="M9 3h6"/>',
book:'<path d="M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v15h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z"/><path d="M12 5v15"/>',
calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
clip:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
check:'<path d="m5 12 5 5 9-10"/>',
checkc:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
infoc:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4.5M12 17.5h.01"/>',
stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M12 8v5M12 16h.01"/>',
bolt:'<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
wifi:'<path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0"/><path d="M12 19h.01"/>',
rig:'<path d="M12 3 5 21M12 3l7 18M8 14h8M6.5 18h11"/>'
};
const ic=(n,cls)=>`<svg class="i ${cls||''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;
const CAT_IC=['shield','droplet','layers','pipe','hook','book','calc','clip'];
const meta={},ALL=[];
M.cats.forEach((c,ci)=>c.sheets.forEach(s=>{meta[s.name]={cat:c.name,ci,color:'#'+c.color,what:s.what,use:s.use};ALL.push({name:s.name,cat:c.name,ci,color:'#'+c.color,what:s.what,use:s.use});}));
const catOf=n=>M.cats[(meta[n]||{ci:0}).ci];
const href=n=>'#/s/'+encodeURIComponent(n);
const app=$('#app'),side=$('#side'),bar=$('#bar'),tabs=$('#tabs'),pop=$('#pop');
let cur=null,calcs=[],cells=new Map(),cfT=[],deferred=null,spy=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;});
function toast(t){const x=$('#toast');x.textContent=t;x.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>x.hidden=true,2600);}

/* ---------- theme ---------- */
function applyTheme(){
  const r=document.documentElement;
  if(st.theme==='light'||st.theme==='dark')r.setAttribute('data-theme',st.theme);else r.removeAttribute('data-theme');
  const dark=st.theme==='dark'||(st.theme!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#080E1B':'#0E1A33';
}
function cycleTheme(){st.theme=st.theme==='auto'?'light':st.theme==='light'?'dark':'auto';applyTheme();saveNow();renderChrome();toast('Theme: '+({auto:'follow device',light:'light',dark:'dark'})[st.theme]);}
applyTheme();
matchMedia('(prefers-color-scheme:dark)').addEventListener&&matchMedia('(prefers-color-scheme:dark)').addEventListener('change',applyTheme);

/* ---------- overlays ---------- */
const modal=$('#modal');
function openModal(node){modal.innerHTML='';modal.append(node);modal.hidden=false;document.body.style.overflow='hidden';}
function closeModal(){modal.hidden=true;modal.innerHTML='';document.body.style.overflow='';}
modal.addEventListener('mousedown',e=>{if(e.target===modal&&modal._dismiss)modal._dismiss();});
function dialog(o){
  return new Promise(res=>{
    const d=h('div','dlg');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    const dh=h('div','dh');dh.append(h('h3','',o.title));d.append(dh);
    const b=h('div','db');if(o.text)b.append(h('div','',o.text));
    let inp=null;if(o.input){inp=h('input','tx');inp.type='text';inp.value=o.input.value||'';inp.placeholder=o.input.ph||'';b.append(inp);}
    if(o.node)b.append(o.node);
    d.append(b);
    const f=h('div','df');
    const done=v=>{closeModal();modal._dismiss=null;res(v);};
    if(o.cancel!==false){const c=h('button','btn',o.cancel||'Cancel');c.onclick=()=>done(null);f.append(c);}
    const ok=h('button','btn '+(o.danger?'danger':'pri'),o.ok||'OK');
    ok.onclick=()=>done(inp?inp.value.trim():true);f.append(ok);
    d.append(f);
    modal._dismiss=()=>done(null);
    d.addEventListener('keydown',e=>{if(e.key==='Escape')done(null);if(e.key==='Enter'&&inp)ok.click();});
    openModal(d);(inp||ok).focus();if(inp)inp.select();
  });
}
function closePop(){pop.hidden=true;pop.innerHTML='';pop.className='pop';}
function popover(anchor,build){
  if(!pop.hidden){closePop();return;}
  pop.innerHTML='';build(pop);pop.hidden=false;
  const narrow=innerWidth<720;
  pop.className='pop'+(narrow?' sheetpop':'');
  if(!narrow){const r=anchor.getBoundingClientRect();pop.style.visibility='hidden';
    const w=pop.offsetWidth,hh2=pop.offsetHeight;
    let left=Math.min(Math.max(8,r.right-w),innerWidth-w-8);let top=r.bottom+6;if(top+hh2>innerHeight-8)top=Math.max(8,r.top-hh2-6);
    pop.style.left=left+'px';pop.style.top=top+'px';pop.style.right='auto';pop.style.bottom='auto';pop.style.visibility='';}
}
document.addEventListener('click',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('[data-pop]'))closePop();});
const mi=(icon,txt,fn,cls)=>{const b=hh('button',cls||'',ic(icon)+'<span></span>');b.lastChild.textContent=txt;b.onclick=()=>{closePop();fn();};return b;};

/* ---------- routing ---------- */
const openCats=new Set([0]);
function route(){
  closePop();document.body.classList.remove('nav-open');
  const hs=decodeURIComponent(location.hash||'');let m;
  if((m=hs.match(/^#\/s\/(.+)$/))&&M.sheets[m[1]]){cur=m[1];pageSheet(m[1]);}
  else if(hs==='#/tools'){cur=null;pageTools();}
  else{cur=null;pageHome();}
  renderChrome();
  window.scrollTo(0,0);app.focus({preventScroll:true});
}
window.addEventListener('hashchange',route);
const here=()=>cur?cur:(location.hash==='#/tools'?'#tools':'#home');

/* ---------- chrome: sidebar, bar, tabs ---------- */
function renderSide(){
  side.innerHTML='';
  const br=hh('div','brand',`<div class="logo">${ic('rig')}</div><div><b>Advisor Toolkit</b><small>Drilling · Completion · Workover</small></div>`);
  const sb=hh('button','sbtn',ic('search')+'<span>Search tools</span><kbd>/</kbd>');sb.onclick=openPalette;
  const nav=h('nav','nav');
  const a=(href_,icon,txt,on,extra)=>{const x=hh('a',on?'on':'',`<span class="ic">${ic(icon)}</span><span></span>`);x.href=href_;x.lastChild.textContent=txt;if(extra)x.append(extra);return x;};
  nav.append(a('#/','home','Home',here()==='#home'),a('#/tools','grid','All tools',here()==='#tools',h('span','cnt',String(ALL.length))));
  const pins=st.pins.filter(n=>M.sheets[n]);
  if(pins.length){nav.append(h('div','grp','Pinned'));pins.forEach(n=>{const x=hh('a',cur===n?'on':'',`<span class="dot" style="background:${meta[n].color}"></span><span></span>`);x.href=href(n);x.lastChild.textContent=n;nav.append(x);});}
  nav.append(h('div','grp','Categories'));
  M.cats.forEach((c,i)=>{
    const d=document.createElement('details');if(openCats.has(i)||(cur&&meta[cur].ci===i))d.open=true;
    d.addEventListener('toggle',()=>{d.open?openCats.add(i):openCats.delete(i);});
    const s=hh('summary','',`<span class="ic"><span class="dot" style="background:#${c.color}"></span></span><span></span><span class="cnt">${c.sheets.length}</span>${ic('chev','chev')}`);
    s.children[1].textContent=c.name;
    const box=h('div');
    c.sheets.forEach(sh=>{const x=h('a',cur===sh.name?'on':'',sh.name);x.href=href(sh.name);box.append(x);});
    d.append(s,box);nav.append(d);
  });
  const ft=hh('div','sfoot','<span class="st"></span><span></span>');
  const off=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
  if(!off)ft.firstChild.classList.add('off');
  ft.lastChild.textContent=(off?'Offline ready':'Online')+' · data stays on this device';
  side.append(br,sb,nav,ft);
}
function renderBar(){
  bar.innerHTML='';
  const hb=hh('button','ibtn',ic('menu'));hb.id='hamb';hb.setAttribute('aria-label','Open menu');hb.onclick=()=>document.body.classList.toggle('nav-open');
  const t=h('div','ttl',cur||(location.hash==='#/tools'?'All tools':'Home'));
  const sb=hh('button','bsearch',ic('search')+'<span>Search tools…</span><kbd>/</kbd>');sb.onclick=openPalette;
  const si=hh('button','ibtn bsearch-i',ic('search'));si.setAttribute('aria-label','Search');si.onclick=openPalette;
  const th=hh('button','ibtn',ic(st.theme==='dark'?'moon':st.theme==='light'?'sun':'auto'));th.setAttribute('aria-label','Theme: '+st.theme);th.title='Theme: '+st.theme;th.onclick=cycleTheme;
  const mb=hh('button','ibtn',ic('more'));mb.setAttribute('aria-label','Menu');mb.dataset.pop='1';mb.onclick=()=>popover(mb,appMenu);
  bar.append(hb,t,h('div','grow'),sb,si,th,mb);
}
function renderTabs(){
  tabs.innerHTML='';
  const home=hh('a',here()==='#home'?'on':'',ic('home')+'<span>Home</span>');home.href='#/';
  const tl=hh('a',here()==='#tools'?'on':'',ic('grid')+'<span>Tools</span>');tl.href='#/tools';
  const se=hh('button','',ic('search')+'<span>Search</span>');se.onclick=openPalette;
  const mo=hh('button','',ic('more')+'<span>More</span>');mo.dataset.pop='1';mo.onclick=()=>popover(mo,appMenu);
  tabs.append(home,tl,se,mo);
}
function renderChrome(){renderSide();renderBar();renderTabs();document.title=(cur?cur+' · ':'')+'Advisor Toolkit';}
$('#scrim').onclick=()=>document.body.classList.remove('nav-open');

/* ---------- command palette ---------- */
function openPalette(){
  document.body.classList.remove('nav-open');closePop();
  const pal=$('#pal');pal.innerHTML='';pal.hidden=false;
  const box=h('div','palbox');
  const inw=hh('div','in',ic('search'));const inp=h('input');inp.placeholder='Search tools, e.g. kill, cement, hook load…';inp.setAttribute('aria-label','Search tools');inw.append(inp);
  const x=hh('button','ibtn',ic('x'));x.onclick=close;x.setAttribute('aria-label','Close');inw.append(x);
  const res=h('div','res');box.append(inw,res);pal.append(box);
  const actions=[
    {label:'Switch theme',what:'Light, dark or follow the device',fn:cycleTheme,r:'Action'},
    {label:'Back up my data',what:'Download a backup file',fn:exportData,r:'Action'},
    {label:'Install on this device',what:'Add to the home screen / desktop',fn:install,r:'Action'}
  ];
  let list=[],sel=0;
  function score(it,toks){
    const nm=(it.name||it.label).toLowerCase(),rest=((it.what||'')+' '+(it.use||'')+' '+(it.cat||'')).toLowerCase();let s=0;
    for(const t of toks){if(nm.startsWith(t))s+=6;else if(nm.includes(t))s+=4;else if(rest.includes(t))s+=1;else return -1;}
    return s;
  }
  function draw(){
    const toks=inp.value.toLowerCase().split(/\s+/).filter(Boolean);
    let items=ALL.concat(actions);
    if(toks.length)items=items.map(it=>[it,score(it,toks)]).filter(p=>p[1]>=0).sort((a,b)=>b[1]-a[1]).map(p=>p[0]);
    else items=(st.recent||[]).filter(n=>M.sheets[n]).map(n=>ALL.find(a=>a.name===n)).concat(ALL.filter(a=>!(st.recent||[]).includes(a.name))).concat(actions);
    list=items.slice(0,40);sel=0;res.innerHTML='';
    if(!list.length){res.append(h('div','empty','Nothing matches "'+inp.value+'"'));return;}
    list.forEach((it,i)=>{
      const r=h('div','it'+(i===0?' sel':''));r.setAttribute('role','option');
      r.innerHTML=(it.color?`<span class="dot" style="background:${it.color}"></span>`:ic('bolt'))+'<div><b></b><small></small></div><span class="r"></span>';
      r.querySelector('b').textContent=it.name||it.label;r.querySelector('small').textContent=(it.what||'').slice(0,110);r.querySelector('.r').textContent=it.cat||it.r;
      r.onclick=()=>go(it);r.onmousemove=()=>{mark(i);};res.append(r);
    });
  }
  function mark(i){const rs=res.children;if(rs[sel])rs[sel].classList.remove('sel');sel=i;if(rs[sel]){rs[sel].classList.add('sel');rs[sel].scrollIntoView({block:'nearest'});}}
  function go(it){close();if(it.fn)it.fn();else location.hash=href(it.name).slice(1);}
  function close(){pal.hidden=true;pal.innerHTML='';}
  inp.oninput=draw;
  inp.onkeydown=e=>{
    if(e.key==='Escape')close();
    else if(e.key==='ArrowDown'){e.preventDefault();mark(Math.min(sel+1,list.length-1));}
    else if(e.key==='ArrowUp'){e.preventDefault();mark(Math.max(sel-1,0));}
    else if(e.key==='Enter'&&list[sel])go(list[sel]);
  };
  pal.onmousedown=e=>{if(e.target===pal)close();};
  draw();inp.focus();
}
document.addEventListener('keydown',e=>{
  const t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA');
  if(((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!typing)){e.preventDefault();openPalette();}
  else if(e.key==='Escape'){document.body.classList.remove('nav-open');closePop();if(!modal.hidden&&modal._dismiss)modal._dismiss();}
});

/* ---------- severity helpers ---------- */
function sev(t){
  t=String(t||'');
  if(/^(STOP|VISIT NOW|NOT FIT|CRITICAL|UNSAT|NON-?COMPLIANT|FAIL)/i.test(t))return 'bad';
  if(/^(CAUTION|WARN|VISIT WITHIN|NEEDS|MARGINAL|FIT WITH|CHECK)/i.test(t))return 'warn';
  if(/^(OK|FIT|SATISF|GOOD|PASS|ROUTINE|COMPLIANT)/i.test(t))return 'ok';
  if(/^(INFO|NOTE)/i.test(t))return 'info';
  return '';
}
const SEVIC={ok:'checkc',warn:'alert',bad:'stop',info:'infoc','':'infoc'};

/* ---------- HOME ---------- */
function greeting(){const hr=new Date().getHours();return hr<5?'Working late':hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';}
function quickCard(n,ci){
  const m=meta[n];const a=h('a','quick');a.href=href(n);a.style.setProperty('--c',m.color);
  a.innerHTML=`<span class="ic">${ic(CAT_IC[m.ci])}</span><div><b></b><small></small></div>`;
  a.querySelector('b').textContent=n;a.querySelector('small').textContent=m.what||'';return a;
}
function pageHome(){
  app.innerHTML='';cur=null;
  const hero=h('div','hero');
  const L=h('div');L.append(h('h1','h1',greeting()+', Eng. Nasser'));
  const dt=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  L.append(h('p','',dt+' · '+ALL.length+' calculators, libraries and audit tools — all work offline'));
  const chip=hh('div','rigchip',ic('rig'));
  const sel=document.createElement('select');sel.setAttribute('aria-label','Active rig');
  Object.keys(st.prof).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.append(o);});sel.value=st.rig;
  sel.onchange=()=>{st.rig=sel.value;apply();saveNow();pageHome();};
  chip.append(h('small','muted','Active rig'),sel);
  hero.append(L,chip);app.append(hero);

  // readiness
  const wce=E.value('WCE Audit',5,2),wceO=E.value('WCE Audit',6,2);
  const vr=E.value('Visit Checklist',5,2),vb=E.value('Visit Checklist',7,1),vsc=E.value('Visit Checklist',5,8),vcr=E.value('Visit Checklist',6,8),vdr=E.value('Visit Checklist',4,8),vpe=E.value('Visit Checklist',6,2);
  const g=h('div','grid g2');
  const mkSev=(txt)=>{const s=sev(txt);const d=h('div','sev'+(s?' sev-'+s:' sev-info'));d.innerHTML=ic(SEVIC[s]);const sp=h('span','',' '+(txt||'—'));d.append(sp);return d;};
  const c1=h('div','card ready');c1.append(hh('h3','',ic('shield')+'<span></span>'));c1.firstChild.lastChild.textContent='Well-control equipment · '+st.rig;
  c1.append(mkSev(String(wce||'No audit data yet')));
  if(wceO)c1.append(h('div','sub',String(wceO)));
  const go1=hh('a','go','Open WCE Audit '+ic('chev'));go1.href=href('WCE Audit');c1.append(go1);
  const c2=h('div','card ready');c2.append(hh('h3','',ic('clip')+'<span></span>'));c2.firstChild.lastChild.textContent='Rig visit · '+st.rig;
  c2.append(mkSev(String(vb||vr||'No visit data yet')));
  const stats=h('div','stats');
  const pill=(t,s)=>h('span','pill'+(s?' sev-'+s:''),t);
  if(vr)stats.append(pill('Rating: '+vr,sev(vr)));
  if(typeof vsc==='number')stats.append(pill('Score '+Math.round(vsc*100)+'%',vsc>=.85?'ok':vsc>=.7?'warn':'bad'));
  if(typeof vcr==='number')stats.append(pill('Critical deficiencies: '+vcr,vcr>0?'bad':'ok'));
  if(typeof vdr==='number')stats.append(pill('DDR red flags: '+vdr,vdr>=3?'bad':vdr>0?'warn':'ok'));
  c2.append(stats);if(vpe)c2.append(h('div','sub',String(vpe)));
  const go2=hh('a','go','Open Visit Checklist '+ic('chev'));go2.href=href('Visit Checklist');c2.append(go2);
  g.append(c1,c2);app.append(g);

  // quick actions
  app.append(hh('h2','h2','Quick start'));
  const q=h('div','grid g4');['Kill Sheet','Volume Calculator','Well Control','Space-Out','Hook Load & Drag','Swab & Surge','Casing Design','Conversions'].filter(n=>M.sheets[n]).forEach(n=>q.append(quickCard(n)));app.append(q);

  const pins=st.pins.filter(n=>M.sheets[n]);const rec=(st.recent||[]).filter(n=>M.sheets[n]&&!pins.includes(n)).slice(0,6);
  const chipRow=(title,list)=>{app.append(h('h2','h2',title));const d=h('div','chips');list.forEach(n=>{const a=hh('a','chip',`<span class="dot" style="width:8px;height:8px;border-radius:50%;background:${meta[n].color}"></span><span></span>`);a.lastChild.textContent=n;a.href=href(n);a.style.setProperty('--c',meta[n].color);d.append(a);});app.append(d);};
  if(pins.length)chipRow('Pinned',pins);
  if(rec.length)chipRow('Recently used',rec);

  // categories
  const hd=h('h2','h2','All categories');hd.append(h('small','','· '+M.cats.length+' groups'));app.append(hd);
  const cg=h('div','grid g3');
  M.cats.forEach((c,i)=>{
    const d=h('div','card cat');d.style.setProperty('--c','#'+c.color);
    const top=h('div','top');top.append(hh('span','ic',ic(CAT_IC[i])));
    const tx=h('div');tx.append(h('h3','',c.name),h('p','',c.desc));top.append(tx);
    const ch=h('div','chips');c.sheets.forEach(s=>{const a=h('a','chip',s.name);a.href=href(s.name);a.style.setProperty('--c','#'+c.color);ch.append(a);});
    d.append(top,ch);cg.append(d);
  });
  app.append(cg);
  app.append(h('p','note','Yellow fields are inputs and green fields are calculated. What you type is saved on this device only. The audit, equipment, tickets and visit sheets are kept per rig. These calculators are screening aids — the approved program and company procedures take priority.'));
}

/* ---------- ALL TOOLS ---------- */
function pageTools(){
  app.innerHTML='';
  const head=h('div','tools-head');const L=h('div');L.append(h('h1','h1','All tools'),h('p','muted',ALL.length+' tools in '+M.cats.length+' categories'));
  const f=hh('label','finder',ic('search'));const inp=h('input');inp.type='search';inp.placeholder='Filter by name or topic…';inp.setAttribute('aria-label','Filter tools');f.append(inp);
  head.append(L,f);app.append(head);
  const holder=h('div');app.append(holder);
  const draw=()=>{
    holder.innerHTML='';const toks=inp.value.toLowerCase().split(/\s+/).filter(Boolean);let any=false;
    M.cats.forEach((c,i)=>{
      const rows=c.sheets.filter(s=>toks.every(t=>(s.name+' '+s.what+' '+s.use+' '+c.name).toLowerCase().includes(t)));
      if(!rows.length)return;any=true;
      const hd=hh('h2','h2',`<span class="dot" style="width:10px;height:10px;border-radius:50%;background:#${c.color}"></span><span></span>`);hd.lastChild.textContent=c.name;hd.append(h('small','','· '+c.desc));holder.append(hd);
      const card=h('div','card');rows.forEach(s=>{const a=hh('a','trow',`<span class="dot" style="background:#${c.color}"></span><div><b></b><small></small></div><span class="go">${ic('chev')}</span>`);a.href=href(s.name);a.querySelector('b').textContent=s.name;a.querySelector('small').textContent=s.what;card.append(a);});holder.append(card);
    });
    if(!any)holder.append(h('p','muted','No tool matches "'+inp.value+'".'));
  };
  inp.oninput=draw;draw();
}

/* ---------- SHEET: parsing ---------- */
const fillOf=c=>S[c[4]][0],isHdr=c=>fillOf(c)==='1F3864',isIn=c=>!c[3]&&fillOf(c)==='FFF2CC';
const kindOf=c=>isIn(c)?'in':c[3]?'calc':'txt';
const hasC=c=>c[2]!==null||isIn(c);
const SECF={D9E2F3:1,D9E1F2:1};
const clean=t=>String(t).replace(/\s{2,}/g,' ').trim();
function stxt(c){
  if(c[2]===null)return'';
  if(c[3])return typeof c[7]==='string'?clean(c[7]):'';
  if(typeof c[2]==='number'){const nf=S[c[4]][6];return nf?Engine.fmtNum(c[2],nf):String(c[2]);}
  return clean(c[2]);
}
function walk(content){
  const fields=[],notes=[];let f=null;
  for(let i=0;i<content.length;i++){
    const c=content[i],k=kindOf(c);
    if(k==='txt'){
      const t=stxt(c);if(t==='')continue;
      const nx=content[i+1];const nxV=nx&&kindOf(nx)!=='txt';
      if(!f&&nxV){f={label:t,vals:[]};fields.push(f);}
      else if(f&&f.vals.length&&nxV&&(t.endsWith(':')||t.length>9)){f={label:t,vals:[]};fields.push(f);}
      else if(f&&f.vals.length&&!f.vals[f.vals.length-1].unit&&t.length<=14&&!(f.vals.length&&c[1]-(f.vals[f.vals.length-1].c[1]+f.vals[f.vals.length-1].c[5])>1&&t.length>9)){f.vals[f.vals.length-1].unit=t;}
      else notes.push(t);
    }else{
      if(!f){f={label:'',vals:[]};fields.push(f);}
      f.vals.push({c,k,unit:''});
    }
  }
  return{fields,notes};
}
function newSec(title,plain){return{title,plain:!!plain,items:[],aside:null};}
function parseSheet(name){
  const sh=M.sheets[name];
  const rows=new Map();sh.cells.forEach(c=>{let a=rows.get(c[0]);if(!a)rows.set(c[0],a=[]);a.push(c);});
  const rks=[...rows.keys()].sort((a,b)=>a-b);
  let asideCol=0;
  for(const rk of rks){const cs=rows.get(rk);const hd=cs.filter(isHdr);if(hd.length&&cs.some(c=>c[1]===1&&hasC(c)&&!isHdr(c))){const mn=Math.min(...hd.map(c=>c[1]));if(mn>=5){asideCol=mn;break;}}}
  const P={title:name,lead:'',secs:[]};
  let sec=newSec('',true);P.secs.push(sec);
  let tbl=null,caps=null;
  for(const rk of rks){
    let cs=rows.get(rk).slice().sort((a,b)=>a[1]-b[1]);
    cs=cs.filter(c=>!(!hasC(c)&&!isHdr(c)&&cs.some(d=>d!==c&&d[1]<c[1]&&d[1]+d[5]>c[1])));
    let ac=[];if(asideCol){ac=cs.filter(c=>c[1]>=asideCol);cs=cs.filter(c=>c[1]<asideCol);}
    const content=cs.filter(hasC);
    const hc=content.filter(isHdr);
    const startSec=t=>{sec=newSec(t);P.secs.push(sec);tbl=null;caps=null;};
    // section rows
    if(content.length===1&&content[0][1]===1&&rk!==1&&(SECF[fillOf(content[0])]||isHdr(content[0]))){startSec(stxt(content[0]));}
    else if(content.length===0){tbl=null;}
    else if(rk===1){P.title=stxt(content[0])||name;}
    else if(content.length===1&&kindOf(content[0])==='txt'&&rk<=3&&!sec.title&&sec.items.length===0&&S[content[0][4]][3]){P.lead+=(P.lead?' ':'')+stxt(content[0]);}
    else if(content.length>0&&hc.length===content.length&&hc.length<=3&&content[0][1]>1){
      caps=content.map(c=>stxt(c));sec.items.push({type:'cap',list:caps});tbl=null;
    }
    else if(hc.length>=2||(hc.length===1&&content.length>=2&&isHdr(content[0]))){
      tbl={type:'table',head:cs.filter(c=>isHdr(c)),rows:[],last:rk};sec.items.push(tbl);
    }
    else if(tbl&&rk===tbl.last+1&&!(content.length===1&&kindOf(content[0])==='txt'&&S[content[0][4]][3])){
      tbl.rows.push(cs.filter(c=>hasC(c)||!isHdr(c)&&false));tbl.last=rk;
    }
    else{
      tbl=null;
      if(content.length===1&&kindOf(content[0])==='txt'){const c0=content[0];sec.items.push({type:'para',text:stxt(c0),strong:!!S[c0[4]][2]&&!S[c0[4]][3]});}
      else{
        const w=walk(content);
        if(!w.fields.length)sec.items.push({type:'para',text:w.notes.join('  '),strong:false});
        else sec.items.push({type:'row',fields:w.fields,notes:w.notes,caps:caps,rk});
      }
    }
    // aside cells
    if(ac.length){
      const cont=ac.filter(c=>hasC(c)||isHdr(c));
      if(cont.length){
        const A=sec.aside=sec.aside||{head:null,rows:[],note:''};
        if(ac.some(isHdr))A.head=ac.filter(isHdr);
        else if(cont.length===1&&kindOf(cont[0])==='txt'&&typeof cont[0][2]==='string'&&cont[0][2].length>20)A.note=clean(cont[0][2]);
        else A.rows.push(ac.filter(hasC));
      }
    }
  }
  P.secs=P.secs.filter(s=>s.items.length||s.aside);
  return P;
}

/* ---------- SHEET: rendering ---------- */
function resolveList(sheet,f1){
  if(!f1)return[];
  if(f1[0]==='"')return f1.slice(1,-1).split(',');
  const m=f1.replace(/\$/g,'').match(/^(?:'?([^'!]+)'?!)?([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if(!m)return[];const sh=m[1]||sheet;const cn=s=>{let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n;};
  const out=[];const c0=cn(m[2]),r0=+m[3],c1=m[4]?cn(m[4]):c0,r1=m[5]?+m[5]:r0;
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const v=E.value(sh,r,c);if(v!==null&&v!==''&&v!==undefined)out.push(String(v));}
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
  const isErr=v&&typeof v==='object'&&'err' in v;
  e.classList.toggle('err',!!isErr);
  e.classList.toggle('s',typeof v==='string');
  if(o.banner){
    const s=sev(t);const b=o.banner;
    const nk='sev-'+(s||'none');
    if(b._k!==nk){b.classList.remove('sev-ok','sev-warn','sev-bad','sev-info','sev-none');if(s)b.classList.add('sev-'+s);b._k=nk;b.firstChild.innerHTML=ic(SEVIC[s]);}
    b.hidden=(t==='');
  }
}
function refresh(){calcs.forEach(setCalc);applyCF();}
function ruleCls(r){
  if(r._k!==undefined)return r._k;
  let k={c:'',t:''};
  if(r.bg){k.c=({F8CBAD:'bad',FFD966:'warn',C6E0B4:'ok',FFF2CC:'pend'})[r.bg]||'';
    if(!k.c){const n=parseInt(r.bg,16),R=n>>16&255,G=n>>8&255,B=n&255,mx=Math.max(R,G,B),mn=Math.min(R,G,B);
      if(mx-mn<24)k.c='mute';else{let hu;const d=mx-mn;if(mx===R)hu=((G-B)/d+6)%6;else if(mx===G)hu=(B-R)/d+2;else hu=(R-G)/d+4;hu*=60;
        k.c=(hu<22||hu>330)?'bad':hu<70?'warn':hu<170?'ok':'info';}}}
  else if(r.fg==='C00000')k.t='tbad';
  else if(r.fg==='7F7F7F')k.t='tmute';
  r._k=k;return k;
}
function applyCF(){
  if(!cfT.length)return;
  const hit=new Map();
  for(const rule of cfT){
    const k=ruleCls(rule);
    for(const g of rule.rg)for(let r=g[0];r<=g[2];r++)for(let c=g[1];c<=g[3];c++){
      const key=r+','+c;const e=cells.get(key);if(!e)continue;
      let x=hit.get(key);if(!x){x={c:'',t:'',b:0};hit.set(key,x);}
      if(x.c&&x.t&&x.b)continue;
      if(!E.cf(cur,rule,r,c))continue;
      if(k.c&&!x.c)x.c=k.c;if(k.t&&!x.t)x.t=k.t;if(rule.b)x.b=1;
    }
  }
  cells.forEach((e,key)=>{
    const x=hit.get(key)||{c:'',t:'',b:0};const nk=x.c+'|'+x.t+'|'+x.b;
    if(e._cf===nk)return;
    if(e._cf!==undefined){const o=e._cf.split('|');if(o[0])e.classList.remove('cf-'+o[0]);if(o[1])e.classList.remove('cf-'+o[1]);e.classList.remove('cfb');}
    if(x.c)e.classList.add('cf-'+x.c);if(x.t)e.classList.add('cf-'+x.t);if(x.b)e.classList.add('cfb');
    e._cf=nk;
  });
}
function mkVal(sheet,v,lab,linked){
  const c=v.c,k=v.k,r=c[0],col=c[1],val=c[2],dv=c[6],cached=c[7],s=S[c[4]];
  const host=h('span','v '+k);
  if(k==='in'){
    const key=r+','+col;const o=getOv(sheet);const has=o&&key in o;const cur0=has?o[key]:val;
    if(dv){
      const sel=document.createElement('select');const items=resolveList(sheet,dv);
      const blank=document.createElement('option');blank.value='';blank.textContent='—';sel.append(blank);
      items.forEach(it=>{const op=document.createElement('option');op.value=it;op.textContent=it;sel.append(op);});
      sel.value=cur0===null||cur0===undefined?'':String(cur0);
      if(sel.value!==(cur0===null||cur0===undefined?'':String(cur0))&&cur0){const op=document.createElement('option');op.value=String(cur0);op.textContent=String(cur0);sel.append(op);sel.value=String(cur0);}
      sel.setAttribute('aria-label',lab||'');
      sel.onchange=()=>setInput(sheet,r,col,sel.value,false);host.append(sel);host.classList.add('sel');
    }else if(s[6]&&/mmm|yy/.test(s[6])){
      const inp=document.createElement('input');inp.type='date';
      const iso=x=>(typeof x==='number'&&x>0)?new Date(Date.UTC(1899,11,30)+Math.round(x)*864e5).toISOString().slice(0,10):'';
      inp.value=iso(cur0);inp.setAttribute('aria-label',lab||'Date');
      inp.addEventListener('input',()=>{const t=inp.value;let sv='';if(t){const [y,m,d]=t.split('-').map(Number);sv=Math.round((Date.UTC(y,m-1,d)-Date.UTC(1899,11,30))/864e5);}setInput(sheet,r,col,sv,false);});
      host.append(inp);
    }else{
      const numeric=(typeof val==='number')||(s[6]&&val===null);
      const inp=document.createElement('input');inp.type='text';if(numeric){inp.inputMode='decimal';host.classList.add('num');}else host.classList.add('tx');
      inp.value=cur0===null||cur0===undefined?'':String(cur0);inp.setAttribute('aria-label',lab||'Input');inp.autocomplete='off';
      inp.addEventListener('input',()=>setInput(sheet,r,col,inp.value,numeric));
      inp.addEventListener('focus',()=>inp.select());host.append(inp);
    }
  }else if(k==='calc'){
    host.append(document.createTextNode(''));calcs.push({el:host,sheet,r,c:col,nf:s[6]});if(linked)host.classList.add('linked');
  }else{
    host.textContent=stxt(c);if(typeof val==='number')host.classList.add('n');
  }
  cells.set(r+','+col,host);
  return host;
}
function isBanner(v){
  if(v.k!=='calc')return false;const c=v.c;const t=typeof c[7]==='string'?c[7]:'';
  return c[5]>=3||t.length>46||/^(OK|CAUTION|STOP|INFO|WARN|VISIT|NOTE)\b/.test(t);
}
function mkBanner(sheet,v,label){
  const b=h('div','banner');b.append(h('span','bi'));
  const bd=h('div');if(label)bd.append(h('small','',label));const tx=h('span','bt');tx.append(document.createTextNode(''));bd.append(tx);b.append(bd);
  calcs.push({el:tx,sheet,r:v.c[0],c:v.c[1],nf:S[v.c[4]][6],banner:b});b.firstChild.innerHTML=ic('infoc');
  return b;
}
function renderRow(sheet,it,body){
  const fs=it.fields;
  const capCols=it.caps;
  // banner row
  if(fs.length===1&&fs[0].vals.length===1&&isBanner(fs[0].vals[0])){
    let lab=fs[0].label.replace(/^Hint\s*:?\s*/i,'');body.append(mkBanner(sheet,fs[0].vals[0],lab));
    it.notes.forEach(n=>body.append(h('p','para',n)));return;
  }
  if(fs.length>=2&&fs.every(f=>f.label&&f.vals.length)){
    const g=h('div','pairs');
    fs.forEach(f=>{const p=h('div','p');p.append(h('div','lb',f.label.replace(/:$/,'')));const ctl=h('div','ctl');f.vals.forEach(v=>{ctl.append(mkVal(sheet,v,f.label));if(v.unit)ctl.append(h('span','u',v.unit));});p.append(ctl);g.append(p);});
    body.append(g);it.notes.forEach(n=>body.append(h('p','para',n)));return;
  }
  const f=h('div','f');
  const lab=fs.map(x=>x.label).filter(Boolean).join(' / ');
  f.append(h('div','lb',lab.replace(/:$/,'')));
  const ctl=h('div','ctl');
  fs.forEach(fl=>fl.vals.forEach(v=>{
    if(isBanner(v)){ctl.append(mkBanner(sheet,v,''));return;}
    const linked=!!(capCols&&v.k==='calc'&&capCols.length>1&&v.c[1]>=3);
    ctl.append(mkVal(sheet,v,lab,linked));if(v.unit)ctl.append(h('span','u',v.unit));
  }));
  f.append(ctl);
  if(it.notes.length)f.append(h('div','help',it.notes.join(' · ')));
  body.append(f);
}
const colPx=(sh,i)=>{const w=sh.widths&&sh.widths[i];return Math.max(60,Math.min(300,Math.round((w||9)*7.2+10)));};
function renderTable(sheet,T,opts){
  opts=opts||{};
  const sh=M.sheets[sheet];
  const all=[T.head].concat(T.rows);
  let nc=0;all.forEach(r=>r.forEach(c=>{nc=Math.max(nc,c[1]+c[5]-1);}));
  const wrap=h('div','tw');
  const tall=T.rows.length>20;if(tall)wrap.classList.add('tall');
  let tb=null,cnt=null;
  const table=h('table','t');if(nc>5)table.classList.add('sticky');
  const cg=document.createElement('colgroup');let tot=0;
  for(let i=1;i<=nc;i++){const col=document.createElement('col');const w=colPx(sh,i);col.style.minWidth=w+'px';col.style.width=w+'px';tot+=w;cg.append(col);}
  table.append(cg);table.style.minWidth=Math.min(tot,2400)+'px';
  const rowCells=(tr,cs,isHead)=>{
    let cursor=1;
    cs.forEach(c=>{
      if(c[1]>cursor){const e=document.createElement(isHead?'th':'td');e.colSpan=c[1]-cursor;tr.append(e);}
      const e=document.createElement(isHead?'th':'td');if(c[5]>1)e.colSpan=c[5];
      if(isHead){
        if(c[3]){const sp=h('span');sp.append(document.createTextNode(''));calcs.push({el:sp,sheet,r:c[0],c:c[1],nf:S[c[4]][6]});e.append(sp);}
        else e.textContent=stxt(c);
      }else{
        const k=kindOf(c);
        if(c[2]===null&&k==='txt'){}
        else{
          const v=mkVal(sheet,{c,k,unit:''},'');e.append(v);
          if(k==='txt'){const t=stxt(c);if(t.length>34)e.classList.add('wrap');if(typeof c[2]==='number')e.classList.add('n');}
          if(k==='calc'&&fillOf(c)==='E2EFDA')e.classList.add('out');
        }
      }
      tr.append(e);cursor=c[1]+c[5];
    });
  };
  const thead=document.createElement('thead'),tr0=document.createElement('tr');rowCells(tr0,T.head,true);thead.append(tr0);table.append(thead);
  const tbody=document.createElement('tbody');
  const trs=[];T.rows.forEach(r=>{const tr=document.createElement('tr');rowCells(tr,r,false);tbody.append(tr);trs.push(tr);});
  table.append(tbody);
  if(T.rows.length>20){
    tb=h('div','tbar');const f=hh('label','finder',ic('search'));const inp=h('input');inp.type='search';inp.placeholder='Filter rows…';inp.setAttribute('aria-label','Filter rows');f.append(inp);
    cnt=h('span','cnt',T.rows.length+' rows');tb.append(f,cnt);wrap.append(tb);
    let t=null;inp.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{
      const q=inp.value.toLowerCase().split(/\s+/).filter(Boolean);let n=0;
      trs.forEach(tr=>{let ok=true;if(q.length){let s=tr.textContent.toLowerCase();tr.querySelectorAll('input').forEach(i=>{s+=' '+i.value.toLowerCase();});tr.querySelectorAll('select').forEach(i=>{s+=' '+i.value.toLowerCase();});ok=q.every(w=>s.includes(w));}
        tr.classList.toggle('hid',!ok);if(ok)n++;});
      cnt.textContent=q.length?(n+' of '+trs.length+' rows'):(trs.length+' rows');},140);};
  }
  const sc=h('div','tscroll');sc.append(table);wrap.append(sc);
  return wrap;
}
function renderSections(P,name){
  const frag=document.createDocumentFragment();const navs=[];
  const color=meta[name].color;
  P.secs.forEach((s,i)=>{
    const sec=h('section','card sec'+(s.plain?' plain':''));sec.style.setProperty('--c',color);sec.id='sec-'+i;
    if(!s.plain){
      const hd=h('header');hd.append(h('h2','',s.title));hd.insertAdjacentHTML('beforeend',ic('chevd','chev'));
      hd.tabIndex=0;hd.setAttribute('role','button');
      const tgl=()=>{sec.classList.toggle('closed');hd.setAttribute('aria-expanded',!sec.classList.contains('closed'));};
      hd.onclick=tgl;hd.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tgl();}};
      sec.append(hd);navs.push({id:sec.id,t:s.title.replace(/^\d+\.\s*/,'')});
    }
    const body=h('div','body');
    const main=body;
    let holder=body;
    if(s.aside){holder=h('div','split two');body.append(holder);const m=h('div','main');holder.append(m);var mainEl=m;}
    const target=s.aside?mainEl:body;
    s.items.forEach(it=>{
      if(it.type==='para')target.append(h('p','para'+(it.strong?' strong':''),it.text));
      else if(it.type==='cap'){const cl=h('div','capline');it.list.forEach((t,j)=>cl.append(h('span','',(j?'↳ ':'')+t)));target.append(cl);}
      else if(it.type==='row')renderRow(name,it,target);
      else if(it.type==='table')target.append(renderTable(name,it));
    });
    if(s.aside){
      const A=s.aside;const as=h('div','aside');
      const head=A.head||[];
      const T={head:head,rows:A.rows};
      if(!head.length&&A.rows.length){T.head=A.rows[0].map(c=>Object.assign([],c,{}));}
      as.append(renderTable(name,T));
      if(A.note)as.append(h('p','para',A.note));
      holder.append(as);
    }
    sec.append(body);frag.append(sec);
  });
  return{frag,navs};
}

/* ---------- SHEET page ---------- */
function pageSheet(name){
  calcs=[];cells=new Map();cfT=M.sheets[name].cf||[];
  st.recent=[name].concat((st.recent||[]).filter(n=>n!==name)).slice(0,8);save();
  const m=meta[name];
  app.innerHTML='';
  const P=parseSheet(name);
  const hd=h('div','card shead');
  const cr=h('div','crumb');
  cr.innerHTML='<a href="#/">Home</a><span>›</span><a href="#/tools"></a><span>›</span><span></span>';
  cr.children[2].textContent=m.cat;cr.children[4].textContent=name;hd.append(cr);
  const tt=h('div','tt');tt.style.setProperty('--c',m.color);tt.append(hh('span','ic',ic(CAT_IC[m.ci])));
  const tx=h('div');tx.append(h('h1','',P.title));
  tx.append(h('p','lead',P.lead||m.what));tt.append(tx);hd.append(tt);
  const mt=h('div','meta');
  const pl=hh('span','pill',`<span style="width:8px;height:8px;border-radius:50%;background:${m.color};display:inline-block"></span><span></span>`);pl.lastChild.textContent=m.cat;mt.append(pl);
  if(PER.includes(name)){const pr=hh('span','pill sev-info',ic('rig')+'<span></span>');pr.lastChild.textContent='Per rig: '+st.rig;mt.append(pr);}
  mt.append(hh('span','legend','<span><i class="a"></i>Input</span><span><i class="b"></i>Calculated</span>'));
  const acts=h('div','acts');
  const pinB=hh('button','btn',ic('star')+'<span></span>');
  const setPin=()=>{pinB.lastChild.textContent=st.pins.includes(name)?'Pinned':'Pin';pinB.classList.toggle('pri',st.pins.includes(name));};setPin();
  pinB.onclick=()=>{const i=st.pins.indexOf(name);if(i>=0)st.pins.splice(i,1);else st.pins.push(name);setPin();save();renderSide();toast(i>=0?'Unpinned':'Pinned to the sidebar and home page');};
  const rs=hh('button','btn',ic('reset')+'<span>Reset</span>');rs.onclick=async()=>{const ok=await dialog({title:'Reset this sheet?',text:'All inputs on "'+name+'" go back to the example values.',ok:'Reset',danger:true});if(ok){setOv(name,undefined);apply();saveNow();pageSheet(name);renderChrome();toast('Sheet reset');}};
  const sc=hh('button','btn',ic('save')+'<span>Scenarios</span>');sc.onclick=scenarioDialog;
  const pr=hh('button','btn',ic('print')+'<span>Print</span>');pr.onclick=()=>window.print();
  acts.append(pinB,rs,sc,pr);mt.append(acts);hd.append(mt);
  if(PER.includes(name))hd.append(rigBar());
  app.append(hd);
  const {frag,navs}=renderSections(P,name);
  const lay=h('div','layout'+(navs.length>=3?' hasToc':''));const main=h('div','mainc');
  if(navs.length>=3){
    const cn=h('nav','chipnav');cn.setAttribute('aria-label','Sections');navs.forEach(n=>{const a=h('a','',n.t);a.href='#';a.dataset.id=n.id;cn.append(a);});
    main.append(cn);
  }
  main.append(frag);
  if(name==='TCP Correlation'){const f=h('section','card sec');f.style.setProperty('--c',m.color);const hd2=h('header');hd2.append(h('h2','','Sketch of the wellhead and TCP string'));f.append(hd2);const fg=h('div','fig');const im=new Image();im.src='img/tcp_sketch.png';im.alt='Wellhead and TCP string sketch';fg.append(im);f.append(fg);main.append(f);}
  lay.append(main);
  if(navs.length>=3){const tc=h('nav','toc');tc.append(h('b','','On this page'));navs.forEach(n=>{const a=h('a','',n.t);a.href='#';a.dataset.id=n.id;tc.append(a);});lay.append(tc);}
  app.append(lay);
  lay.querySelectorAll('[data-id]').forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.dataset.id);if(t){t.classList.remove('closed');t.scrollIntoView({behavior:'smooth',block:'start'});}});
  setupSpy(lay);
  refresh();
}
function setupSpy(lay){
  if(spy){spy.disconnect();spy=null;}
  const links=[...lay.querySelectorAll('[data-id]')];if(!links.length||!('IntersectionObserver' in window))return;
  const secs=links.map(a=>document.getElementById(a.dataset.id)).filter((x,i,a)=>x&&a.indexOf(x)===i);
  spy=new IntersectionObserver(es=>{
    es.forEach(en=>{if(en.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.dataset.id===en.target.id));
      const cn=lay.querySelector('.chipnav a.on');if(cn&&cn.parentElement.scrollWidth>cn.parentElement.clientWidth){const p=cn.parentElement;p.scrollTo({left:cn.offsetLeft-p.clientWidth/2+cn.clientWidth/2,behavior:'smooth'});}}});
  },{rootMargin:'-120px 0px -65% 0px'});
  secs.forEach(s=>spy.observe(s));
}
function setInput(sheet,r,col,raw,numeric){
  const key=r+','+col;let v=raw;
  if(numeric){const t=String(raw).trim().replace(/,/g,'.');if(t===''){v='';}else if(!isNaN(Number(t)))v=Number(t);}
  getOv(sheet,true)[key]=v;
  apply();refresh();save();
}

/* ---------- rig profiles ---------- */
function rigBar(){
  const b=h('div','rigbar');b.append(hh('b','',ic('rig')+' Rig / well'));
  const sel=document.createElement('select');sel.setAttribute('aria-label','Rig');Object.keys(st.prof).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.append(o);});sel.value=st.rig;
  sel.onchange=()=>{st.rig=sel.value;apply();saveNow();pageSheet(cur);renderChrome();};
  const mk=(icon,t,fn,cls)=>{const x=hh('button','btn sm '+(cls||''),ic(icon)+'<span></span>');x.lastChild.textContent=t;x.onclick=fn;return x;};
  b.append(sel,
    mk('plus','New',async()=>{const n=await dialog({title:'New rig / well',text:'Audit, equipment, tickets, checklist and visit data are kept separately for each one.',input:{ph:'e.g. Rig 07'},ok:'Create'});if(!n||st.prof[n]){if(n)toast('That name already exists');return;}st.prof[n]={};st.rig=n;apply();saveNow();pageSheet(cur);renderChrome();}),
    mk('edit','Rename',async()=>{const n=await dialog({title:'Rename '+st.rig,input:{value:st.rig},ok:'Rename'});if(!n||n===st.rig||st.prof[n])return;st.prof[n]=st.prof[st.rig];delete st.prof[st.rig];st.rig=n;apply();saveNow();pageSheet(cur);renderChrome();}),
    mk('trash','Delete',async()=>{if(Object.keys(st.prof).length<2){toast('Keep at least one rig');return;}const ok=await dialog({title:'Delete '+st.rig+'?',text:'This removes all audit, equipment, ticket, checklist and visit data stored for this rig on this device.',ok:'Delete',danger:true});if(ok){delete st.prof[st.rig];st.rig=Object.keys(st.prof)[0];apply();saveNow();pageSheet(cur);renderChrome();}},'danger'));
  b.append(h('div','t','Audit, equipment, tickets, checklist and visit report are kept separately for each rig. Switch rig here.'));
  return b;
}

/* ---------- scenarios, menu, backup ---------- */
function scenarioDialog(){
  const name=cur;const node=h('div');
  const list=(scn[name]=scn[name]||{});
  const draw=()=>{
    node.innerHTML='';
    const nm=Object.keys(list);
    node.append(h('div','muted','Save the current inputs of this sheet under a name and reload them later.'));
    const inp=h('input','tx');inp.placeholder='Scenario name, e.g. Well A kill sheet';node.append(inp);
    const sv=h('button','btn pri','Save current inputs');sv.style.marginTop='10px';
    sv.onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();return;}list[n]=JSON.parse(JSON.stringify(getOv(name)||{}));saveNow();toast('Saved: '+n);draw();};node.append(sv);
    if(nm.length){node.append(hh('div','h2',''));node.lastChild.style.fontSize='14px';node.lastChild.textContent='Saved scenarios';}
    nm.forEach(n=>{const r=h('div','scn');r.append(h('b','',n));
      const l=h('button','btn sm','Load');l.onclick=()=>{setOv(name,JSON.parse(JSON.stringify(list[n])));apply();saveNow();closeModal();pageSheet(name);renderChrome();toast('Loaded: '+n);};
      const d=h('button','btn sm danger','Delete');d.onclick=()=>{delete list[n];saveNow();draw();};
      r.append(l,d);node.append(r);});
    if(!nm.length)node.append(h('p','muted','No scenarios saved for this sheet yet.'));
  };
  draw();
  dialog({title:'Scenarios · '+name,node,ok:'Done',cancel:false});
}
function appMenu(p){
  p.append(h('div','h','App'));
  p.append(mi(st.theme==='dark'?'moon':st.theme==='light'?'sun':'auto','Theme: '+({auto:'follow device',light:'light',dark:'dark'})[st.theme]+' (tap to change)',cycleTheme));
  p.append(mi('download','Install on this device',install));
  p.append(h('hr'));
  p.append(h('div','h','Your data'));
  p.append(mi('download','Back up my data (download file)',exportData));
  p.append(mi('upload','Restore from a backup file',importData));
  p.append(mi('trash','Erase all saved inputs on this device',async()=>{const ok=await dialog({title:'Erase everything?',text:'Every saved input, pin, rig profile and scenario on this device will be removed. Back up first if unsure.',ok:'Erase all',danger:true});if(ok){st={ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1',theme:st.theme};scn={};apply();saveNow();route();toast('Erased');}},'danger'));
  p.append(h('hr'));
  p.append(h('div','tx','Advisor Toolkit · calculators are screening aids. The approved program and company procedures take priority.'));
}
function install(){
  if(deferred){deferred.prompt();deferred=null;return;}
  const n=h('div');n.innerHTML='<p><b>iPhone / iPad (Safari):</b> Share, then Add to Home Screen.</p><p><b>Android (Chrome):</b> menu, then Install app or Add to Home screen.</p><p><b>Laptop (Chrome / Edge):</b> the install icon at the right of the address bar.</p><p class="muted">Install only works from the https address where the files are hosted.</p>';
  dialog({title:'Install the app',node:n,ok:'Got it',cancel:false});
}
function exportData(){
  const blob=new Blob([JSON.stringify({app:'advisor-toolkit',v:1,st,scn},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='advisor-toolkit-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();toast('Backup downloaded');
}
function importData(){
  const i=document.createElement('input');i.type='file';i.accept='application/json,.json';
  i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.app!=='advisor-toolkit')throw 0;st=Object.assign({ov:{},pins:[],recent:[],prof:{'Rig 1':{}},rig:'Rig 1',theme:'auto'},d.st);if(!st.prof[st.rig])st.rig=Object.keys(st.prof)[0];scn=d.scn||{};apply();applyTheme();saveNow();route();toast('Backup restored');}catch(e){toast('That file is not a toolkit backup');}};r.readAsText(f);};
  i.click();
}
window.addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNow();});
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').then(()=>renderSide()).catch(()=>{});
window.__tk={E,parseSheet,M};
route();
})();
