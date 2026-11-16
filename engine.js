// Small Excel formula engine for the Advisor Toolkit (covers every function used in the workbook)
(function(root){
'use strict';
const ERR=(e)=>({err:e});
const isErr=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&'err' in v;
const isArr=Array.isArray;
// ---------- number formatting ----------
function roundHalf(x,d){const m=Math.pow(10,d);const s=x<0?-1:1;return s*Math.round(Math.abs(x)*m+1e-9*Math.abs(x)*m*0+Number.EPSILON*Math.abs(x)*m)/m;}
function fmtNum(v,nf){
  if(nf==null||nf==='General')return numToStr(v);
  if(nf.includes(';')){const parts=nf.split(';');let sec=parts[0],val=v;if(v<0&&parts.length>1){sec=parts[1];val=-v;}else if(v===0&&parts.length>2)sec=parts[2];return fmtNum(val,sec);}
  let pre='',suf='',core=nf;
  const lead=core.match(/^([+\-])(.*)$/);if(lead){pre=lead[1];core=lead[2];}
  let m=core.match(/^"([^"]*)"(.*)$/); if(m){pre+=m[1];core=m[2];}
  m=core.match(/^(.*?)"([^"]*)"$/); if(m){core=m[1];suf=m[2];}
  if(/[dmy]/i.test(core.replace(/\\./g,'').replace(/"[^"]*"/g,''))&&!/[0#]/.test(core.replace(/\\./g,''))){return pre+fmtDate(v,core)+suf;}
  const pct=core.endsWith('%'); if(pct){core=core.slice(0,-1);v=v*100;}
  const sci=core.match(/^0(?:\.(0+))?E\+00$/);
  if(sci){const d=sci[1]?sci[1].length:0;if(v===0)return pre+(0).toFixed(d)+'E+00'+suf;let e=Math.floor(Math.log10(Math.abs(v)));let mm=v/Math.pow(10,e);mm=roundHalf(mm,d);if(Math.abs(mm)>=10){mm/=10;e++;}return pre+mm.toFixed(d)+'E'+(e<0?'-':'+')+String(Math.abs(e)).padStart(2,'0')+suf;}
  const comma=core.includes(',');
  const dm=core.match(/\.([0#]+)/); const dmin=dm?(dm[1].match(/0/g)||[]).length:0, dmax=dm?dm[1].length:0;
  let r=roundHalf(v,dmax); let s=Math.abs(r).toFixed(dmax);
  if(dmax>dmin){let [i,f]=s.split('.');while(f.length>dmin&&f.endsWith('0'))f=f.slice(0,-1);s=f.length?i+'.'+f:i;}
  if(comma){const [i,f]=s.split('.');s=i.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(f!==undefined?'.'+f:'');}
  const neg=r<0&&Number(s.replace(/,/g,''))!==0;
  return (neg?'-':'')+pre+s+(pct?'%':'')+suf;
}
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
function fmtDate(serial,f){
  const d=new Date(Date.UTC(1899,11,30)+Math.floor(serial)*86400000);
  const y=d.getUTCFullYear(),m=d.getUTCMonth(),dd=d.getUTCDate();
  return f.replace(/\\(.)/g,'$1').replace(/yyyy|yy|mmmm|mmm|mm|m|dd|d/gi,t=>{
    switch(t.toLowerCase()){case'yyyy':return String(y);case'yy':return String(y).slice(2);case'mmmm':return MON[m];case'mmm':return MON[m].slice(0,3);case'mm':return String(m+1).padStart(2,'0');case'm':return String(m+1);case'dd':return String(dd).padStart(2,'0');default:return String(dd);}});
}
function numToStr(v){
  if(typeof v!=='number')return String(v);
  if(Number.isInteger(v))return String(v);
  let s=Number(v.toPrecision(15)).toString();
  if(/e/.test(s)){s=Number(v.toPrecision(15)).toString();}
  return s;
}
function toStr(v){
  if(v===null||v===undefined)return '';
  if(typeof v==='number')return numToStr(v);
  if(typeof v==='boolean')return v?'TRUE':'FALSE';
  if(isErr(v))return v.err;
  return String(v);
}
function toNum(v){ // returns number or error
  if(isErr(v))return v;
  if(v===null||v===undefined||v==='')return 0;
  if(typeof v==='number')return v;
  if(typeof v==='boolean')return v?1:0;
  if(typeof v==='string'){const t=v.trim();if(t!==''&&!isNaN(Number(t)))return Number(t);return ERR('#VALUE!');}
  if(isArr(v))return toNum(v[0][0]);
  return ERR('#VALUE!');
}
function toBool(v){
  if(isErr(v))return v;
  if(isArr(v))v=v[0][0];
  if(v===null||v==='')return false;
  if(typeof v==='boolean')return v;
  if(typeof v==='number')return v!==0;
  if(typeof v==='string'){const u=v.toUpperCase();if(u==='TRUE')return true;if(u==='FALSE')return false;return ERR('#VALUE!');}
  return false;
}
// ---------- lexer / parser ----------
function colNum(s){let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n;}
function lex(src){
  const t=[];let i=0;const n=src.length;
  while(i<n){
    const ch=src[i];
    if(ch===' '||ch==='\t'){i++;continue;}
    if(ch==='"'){let j=i+1,s='';while(j<n){if(src[j]==='"'){if(src[j+1]==='"'){s+='"';j+=2;continue;}break;}s+=src[j++];}t.push({k:'str',v:s});i=j+1;continue;}
    if(/[0-9.]/.test(ch)){const m=src.slice(i).match(/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/);if(m){t.push({k:'num',v:parseFloat(m[0])});i+=m[0].length;continue;}}
    // reference with optional sheet
    let mc=src.slice(i).match(/^(?:'((?:[^']|'')+)'!|([A-Za-z_][A-Za-z0-9_\.]*)!)?(\$?[A-Z]{1,3}):(\$?[A-Z]{1,3})(?![A-Za-z0-9_\(])/);
    if(mc){t.push({k:'ref',sheet:mc[1]?mc[1].replace(/''/g,"'"):(mc[2]||null),a:mc[3].replace(/^(\$?)([A-Z]+)$/,'$1$2$$1'),b:mc[4].replace(/^(\$?)([A-Z]+)$/,'$1$2$$1048576')});i+=mc[0].length;continue;}
    let m=src.slice(i).match(/^(?:'((?:[^']|'')+)'!|([A-Za-z_][A-Za-z0-9_\.]*)!)?(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?(?![A-Za-z0-9_\(])/);
    if(m){t.push({k:'ref',sheet:m[1]?m[1].replace(/''/g,"'"):(m[2]||null),a:m[3],b:m[4]||null});i+=m[0].length;continue;}
    m=src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_\.]*/);
    if(m){const nm=m[0];i+=nm.length;if(src[i]==='('){t.push({k:'fn',v:nm.toUpperCase()});i++;}else if(/^(TRUE|FALSE)$/i.test(nm))t.push({k:'bool',v:nm.toUpperCase()==='TRUE'});else t.push({k:'name',v:nm});continue;}
    const two=src.slice(i,i+2);
    if(two==='<>'||two==='<='||two==='>='){t.push({k:'op',v:two});i+=2;continue;}
    if('+-*/^&=<>(),%{};'.includes(ch)){t.push({k:'op',v:ch});i++;continue;}
    throw new Error('lex '+ch+' in '+src);
  }
  return t;
}
function parse(src){
  const toks=lex(src);let p=0;
  const peek=()=>toks[p],next=()=>toks[p++];
  const isOp=(v)=>peek()&&peek().k==='op'&&peek().v===v;
  function expr(){return cmp();}
  function cmp(){let l=cat();while(peek()&&peek().k==='op'&&['=','<>','<','>','<=','>='].includes(peek().v)){const o=next().v;l={t:'bin',o,l,r:cat()};}return l;}
  function cat(){let l=add();while(isOp('&')){next();l={t:'bin',o:'&',l,r:add()};}return l;}
  function add(){let l=mul();while(isOp('+')||isOp('-')){const o=next().v;l={t:'bin',o,l,r:mul()};}return l;}
  function mul(){let l=pow();while(isOp('*')||isOp('/')){const o=next().v;l={t:'bin',o,l,r:pow()};}return l;}
  function pow(){let l=unary();while(isOp('^')){next();l={t:'bin',o:'^',l,r:unary()};}return l;}
  function unary(){if(isOp('-')){next();return{t:'neg',e:unary()};}if(isOp('+')){next();return unary();}return pct();}
  function pct(){let e=prim();while(isOp('%')){next();e={t:'bin',o:'/',l:e,r:{t:'num',v:100}};}return e;}
  function prim(){
    const k=next();if(!k)throw new Error('eof in '+src);
    if(k.k==='num')return{t:'num',v:k.v};
    if(k.k==='str')return{t:'str',v:k.v};
    if(k.k==='bool')return{t:'bool',v:k.v};
    if(k.k==='ref')return{t:'ref',sheet:k.sheet,a:k.a,b:k.b};
    if(k.k==='op'&&k.v==='('){const e=expr();if(!isOp(')'))throw new Error('missing ) in '+src);next();return e;}
    if(k.k==='op'&&k.v==='{'){const rows=[[]];while(true){const e=expr();rows[rows.length-1].push(e);if(isOp(',')){next();continue;}if(isOp(';')){next();rows.push([]);continue;}if(isOp('}')){next();break;}throw new Error('bad array in '+src);}return{t:'arr',rows};}
    if(k.k==='fn'){const args=[];if(isOp(')')){next();return{t:'fn',n:k.v,args};}
      while(true){if(isOp(',')||isOp(')'))args.push({t:'empty'});else args.push(expr());if(isOp(',')){next();continue;}if(isOp(')')){next();break;}throw new Error('bad args in '+src);}
      return{t:'fn',n:k.v,args};}
    throw new Error('unexpected '+JSON.stringify(k)+' in '+src);
  }
  const e=expr();if(p<toks.length)throw new Error('trailing in '+src);return e;
}
function parseAddrF(a){const m=a.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);return{c:colNum(m[2]),r:parseInt(m[4],10),ca:m[1]==='$',ra:m[3]==='$'};}
function parseAddr(a){const m=a.replace(/\$/g,'').match(/^([A-Z]+)(\d+)$/);return{c:colNum(m[1]),r:parseInt(m[2],10)};}
// ---------- comparison / ops ----------
function cmpVals(a,b){
  if(a===null||a===undefined)a=(typeof b==='string')?'':(typeof b==='boolean'?false:0);
  if(b===null||b===undefined)b=(typeof a==='string')?'':(typeof a==='boolean'?false:0);
  const rank=x=>typeof x==='number'?1:typeof x==='string'?2:3;
  const ra=rank(a),rb=rank(b);
  if(ra!==rb)return ra<rb?-1:1;
  if(ra===2){const x=a.toLowerCase(),y=b.toLowerCase();return x<y?-1:x>y?1:0;}
  return a<b?-1:a>b?1:0;
}
function broadcast(a,b,f){
  if(!isArr(a)&&!isArr(b))return f(a,b);
  const ra=isArr(a)?a.length:1,ca=isArr(a)?a[0].length:1,rb=isArr(b)?b.length:1,cb=isArr(b)?b[0].length:1;
  const R=Math.max(ra,rb),C=Math.max(ca,cb);const out=[];
  for(let i=0;i<R;i++){const row=[];for(let j=0;j<C;j++){
    const x=isArr(a)?(a[ra===1?0:i]||[])[ca===1?0:j]:a;const y=isArr(b)?(b[rb===1?0:i]||[])[cb===1?0:j]:b;
    row.push(f(x===undefined?ERR('#N/A'):x,y===undefined?ERR('#N/A'):y));}out.push(row);}
  return out;
}
function binop(o,x,y){
  if(isErr(x))return x;if(isErr(y))return y;
  if(o==='&')return toStr(x)+toStr(y);
  if(['=','<>','<','>','<=','>='].includes(o)){const c=cmpVals(x,y);return o==='='?c===0:o==='<>'?c!==0:o==='<'?c<0:o==='>'?c>0:o==='<='?c<=0:c>=0;}
  const a=toNum(x),b=toNum(y);if(isErr(a))return a;if(isErr(b))return b;
  switch(o){case'+':return a+b;case'-':return a-b;case'*':return a*b;case'/':return b===0?ERR('#DIV/0!'):a/b;
    case'^':{const r=Math.pow(a,b);return Number.isFinite(r)?r:ERR('#NUM!');}}
}
// ---------- functions ----------
function flat(args,onlyNums){ // collect values from args (arrays flattened); returns {vals, err}
  const out=[];
  for(const a of args){
    if(isArr(a)){for(const row of a)for(const v of row){if(isErr(v))return{err:v};if(typeof v==='number')out.push(v);}}
    else{if(isErr(a))return{err:a};if(a===null||a===undefined)continue;if(typeof a==='number')out.push(a);else if(typeof a==='boolean')out.push(a?1:0);else if(typeof a==='string'&&a.trim()!==''&&!isNaN(Number(a)))out.push(Number(a));else if(typeof a==='string')return{err:ERR('#VALUE!')};}
  }
  return{vals:out};
}
function critFn(c){
  if(typeof c==='number')return v=>typeof v==='number'&&v===c;
  if(typeof c==='boolean')return v=>v===c;
  const s=toStr(c);const m=s.match(/^(<=|>=|<>|<|>|=)?(.*)$/s);const op=m[1]||'=',rest=m[2];
  const num=rest!==''&&!isNaN(Number(rest))?Number(rest):null;
  return v=>{
    if(num!==null){if(typeof v!=='number')return op==='<>';const d=v-num;return op==='='?d===0:op==='<>'?d!==0:op==='<'?d<0:op==='>'?d>0:op==='<='?d<=0:d>=0;}
    if(v===null||v===undefined)v='';if(typeof v!=='string')return op==='<>';
    const a=v.toLowerCase(),b=rest.toLowerCase();
    if(/[*?]/.test(b)&&(op==='='||op==='<>')){const re=new RegExp('^'+b.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$');return op==='='?re.test(a):!re.test(a);}
    if(op==='=')return a===b;if(op==='<>')return a!==b;const c2=a<b?-1:a>b?1:0;return op==='<'?c2<0:op==='>'?c2>0:op==='<='?c2<=0:c2>=0;};
}
const num1=f=>(args)=>{const a=toNum(args[0]);if(isErr(a))return a;const r=f(a);return Number.isFinite(r)?r:ERR('#NUM!');};
const MATH={ABS:Math.abs,ACOS:Math.acos,ASIN:Math.asin,ATAN:Math.atan,COS:Math.cos,SIN:Math.sin,TAN:Math.tan,DEGREES:x=>x*180/Math.PI,RADIANS:x=>x*Math.PI/180,EXP:Math.exp,LN:Math.log,LOG10:Math.log10,SQRT:x=>x<0?NaN:Math.sqrt(x),INT:Math.floor};
const FN={};
for(const k in MATH)FN[k]=num1(MATH[k]);
FN.PI=()=>Math.PI;
FN.SUM=a=>{const r=flat(a);return r.err||r.vals.reduce((x,y)=>x+y,0);};
FN.MAX=a=>{const r=flat(a);return r.err||(r.vals.length?Math.max(...r.vals):0);};
FN.MIN=a=>{const r=flat(a);return r.err||(r.vals.length?Math.min(...r.vals):0);};
FN.AVERAGE=a=>{const r=flat(a);return r.err||(r.vals.length?r.vals.reduce((x,y)=>x+y,0)/r.vals.length:ERR('#DIV/0!'));};
FN.COUNT=a=>{let n=0;for(const x of a){if(isArr(x)){for(const row of x)for(const v of row)if(typeof v==='number')n++;}else if(typeof x==='number')n++;}return n;};
FN.COUNTA=a=>{let n=0;for(const x of a){if(isArr(x)){for(const row of x)for(const v of row)if(v!==null&&v!==undefined&&v!=='')n++;}else if(x!==null)n++;}return n;};
FN.COUNTIF=a=>{const f=critFn(a[1]);let n=0;for(const row of a[0])for(const v of row)if(f(v))n++;return n;};
FN.SUMIF=a=>{const f=critFn(a[1]);const sr=a[2]||a[0];let s=0;a[0].forEach((row,i)=>row.forEach((v,j)=>{if(f(v)){const x=sr[i][j];if(typeof x==='number')s+=x;}}));return s;};
FN.SUMPRODUCT=a=>{
  let tot=0;const arrs=a.map(x=>isArr(x)?x:[[x]]);
  const R=arrs[0].length,C=arrs[0][0].length;
  for(const x of arrs)if(x.length!==R||x[0].length!==C)return ERR('#VALUE!');
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){let p=1;for(const x of arrs){const v=x[i][j];if(isErr(v))return v;p*=(typeof v==='number'?v:(typeof v==='boolean'?0:0));}tot+=p;}
  return tot;};
FN.ROUND=a=>{const x=toNum(a[0]),d=toNum(a[1]);if(isErr(x))return x;if(isErr(d))return d;const m=Math.pow(10,d);return Math.sign(x)*Math.round(Math.abs(x)*m+1e-9)/m;};
FN.ROUNDUP=a=>{const x=toNum(a[0]),d=toNum(a[1]);if(isErr(x))return x;if(isErr(d))return d;const m=Math.pow(10,d);return Math.sign(x)*Math.ceil(Math.abs(x)*m-1e-9)/m;};
FN.ROUNDDOWN=a=>{const x=toNum(a[0]),d=toNum(a[1]);if(isErr(x))return x;const m=Math.pow(10,d);return Math.sign(x)*Math.floor(Math.abs(x)*m+1e-9)/m;};
FN.MOD=a=>{const x=toNum(a[0]),y=toNum(a[1]);if(isErr(x))return x;if(isErr(y))return y;return y===0?ERR('#DIV/0!'):x-y*Math.floor(x/y);};
FN.POWER=a=>binop('^',a[0],a[1]);
FN.NOT=a=>{const b=toBool(a[0]);return isErr(b)?b:!b;};
FN.ISNUMBER=a=>typeof a[0]==='number';
FN.ISERROR=a=>isErr(a[0]);
FN.ISBLANK=a=>a[0]===null||a[0]===undefined;
FN.LEFT=a=>toStr(a[0]).slice(0,a[1]===undefined?1:toNum(a[1]));
FN.RIGHT=a=>{const s=toStr(a[0]),n=a[1]===undefined?1:toNum(a[1]);return n?s.slice(-n):'';};
FN.LEN=a=>toStr(a[0]).length;
FN.UPPER=a=>toStr(a[0]).toUpperCase();FN.LOWER=a=>toStr(a[0]).toLowerCase();
FN.TEXT=a=>{const v=a[0];if(isErr(v))return v;if(typeof v==='string')return v;const n=toNum(v);return isErr(n)?n:fmtNum(n,toStr(a[1]));};
FN.SMALL=a=>{const r=flat([a[0]]);if(r.err)return r.err;const k=toNum(a[1]);if(isErr(k))return k;const s=r.vals.slice().sort((x,y)=>x-y);return k>=1&&k<=s.length?s[k-1]:ERR('#NUM!');};
FN.LARGE=a=>{const r=flat([a[0]]);if(r.err)return r.err;const k=toNum(a[1]);const s=r.vals.slice().sort((x,y)=>y-x);return k>=1&&k<=s.length?s[k-1]:ERR('#NUM!');};
FN.INDEX=a=>{
  const arr=isArr(a[0])?a[0]:[[a[0]]];const R=arr.length,C=arr[0].length;
  let r=a[1]===undefined||a[1]===null?0:toNum(a[1]),c=a[2]===undefined||a[2]===null?0:toNum(a[2]);
  if(isErr(r))return r;if(isErr(c))return c;
  if(a.length<3||a[2]===undefined){ if(R===1&&C>1){c=r;r=0;} }
  if(r<0||c<0||r>R||c>C)return ERR('#REF!');
  if(r===0&&c===0)return arr;
  if(r===0)return arr.map(row=>[row[c-1]]);
  if(c===0)return [arr[r-1].slice()];
  const v=arr[r-1][c-1];return v===undefined?null:v;
};
FN.MATCH=a=>{
  const key=a[0];const arr=isArr(a[1])?a[1]:[[a[1]]];const list=[];for(const row of arr)for(const v of row)list.push(v);
  const t=a[2]===undefined?1:toNum(a[2]);
  if(isErr(key))return key;
  if(t===0){for(let i=0;i<list.length;i++){const v=list[i];if(v===null||isErr(v))continue;if(typeof v===typeof key&&cmpVals(v,key)===0)return i+1;}return ERR('#N/A');}
  let best=-1;
  for(let i=0;i<list.length;i++){const v=list[i];if(v===null||isErr(v)||typeof v!==typeof key)continue;const c=cmpVals(v,key);if(t>0?c<=0:c>=0)best=i;else if(best>=0)break;}
  return best>=0?best+1:ERR('#N/A');
};
FN.COUNTIFS=a=>{let n=0;const R=a[0].length,C=a[0][0].length;const fs=[];for(let k=0;k<a.length;k+=2)fs.push([a[k],critFn(a[k+1])]);
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){let ok=true;for(const [rg,f] of fs){const v=(rg[i]||[])[j];if(!f(v===undefined?null:v)){ok=false;break;}}if(ok)n++;}return n;};
FN.ROWS=a=>isArr(a[0])?a[0].length:1;
FN.COLUMNS=a=>isArr(a[0])?a[0][0].length:1;
FN.SEARCH=a=>{const f=toStr(a[0]).toLowerCase(),t=toStr(a[1]).toLowerCase();const st=a[2]===undefined?1:toNum(a[2]);const i=t.indexOf(f,st-1);return i<0?ERR('#VALUE!'):i+1;};
FN.FIND=a=>{const f=toStr(a[0]),t=toStr(a[1]);const i=t.indexOf(f);return i<0?ERR('#VALUE!'):i+1;};
FN.RANK=a=>{const x=toNum(a[0]);if(isErr(x))return x;const r=flat([a[1]]);if(r.err)return r.err;const ord=a[2]===undefined?0:toNum(a[2]);if(!r.vals.includes(x))return ERR('#N/A');return 1+r.vals.filter(v=>ord?v<x:v>x).length;};
FN.CHOOSE=a=>{const i=toNum(a[0]);return a[i]===undefined?ERR('#VALUE!'):a[i];};
FN.TODAY=()=>{if(Engine.fixedToday)return Engine.fixedToday;const n=new Date();return Math.round((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-Date.UTC(1899,11,30))/86400000);};
// ---------- engine ----------
function Engine(model){
  const S={};
  for(const [name,sh] of Object.entries(model.sheets)){
    const m=new Map();
    for(const c of sh.cells)m.set(c[0]+','+c[1],{v:c[2],f:c[3]===1,ast:null});
    S[name]=m;
  }
  let ov={},cache=new Map(),stack=new Set();
  function cellVal(sheet,r,c){
    const m=S[sheet];if(!m)return ERR('#REF!');
    const k=r+','+c;const o=ov[sheet];
    if(o&&Object.prototype.hasOwnProperty.call(o,k)){const x=o[k];return x===''?null:x;}
    const cell=m.get(k);if(!cell)return null;
    if(!cell.f)return cell.v===''?null:cell.v;
    const key=sheet+'!'+k;
    if(cache.has(key))return cache.get(key);
    if(stack.has(key))return ERR('#REF!');
    stack.add(key);
    let res;
    try{if(!cell.ast)cell.ast=parse(cell.v);res=ev(cell.ast,sheet);}catch(e){res=ERR('#NAME?');if(typeof console!=='undefined'&&Engine.debug)console.log('ENGINE',sheet,k,cell.v,e.message);}
    stack.delete(key);
    if(isArr(res))res=res[0][0];
    if(res===undefined)res=null;
    cache.set(key,res);return res;
  }
  function range(sheet,a,b,sh){
    let A=parseAddrF(a),B=b?parseAddrF(b):A;
    if(sh){A={r:A.r+(A.ra?0:sh.dr),c:A.c+(A.ca?0:sh.dc)};B={r:B.r+(B.ra?0:sh.dr),c:B.c+(B.ca?0:sh.dc)};}
    const lim=(model.sheets[sheet]||{rows:1000}).rows+1;if(B.r>1000000)B={r:lim,c:B.c};if(A.r>1000000)A={r:lim,c:A.c};
    const r0=Math.min(A.r,B.r),r1=Math.max(A.r,B.r),c0=Math.min(A.c,B.c),c1=Math.max(A.c,B.c);
    const out=[];for(let r=r0;r<=r1;r++){const row=[];for(let c=c0;c<=c1;c++)row.push(cellVal(sheet,r,c));out.push(row);}
    return out;
  }
  function ev(n,sheet,sh){
    switch(n.t){
      case 'num':case 'str':case 'bool':return n.v;
      case 'empty':return null;
      case 'arr':return n.rows.map(r=>r.map(x=>ev(x,sheet,sh)));
      case 'ref':{const sn=n.sheet||sheet;if(!n.b){const A=parseAddrF(n.a);return cellVal(sn,A.r+(sh&&!A.ra?sh.dr:0),A.c+(sh&&!A.ca?sh.dc:0));}return range(sn,n.a,n.b,sh);}
      case 'neg':{const v=ev(n.e,sheet,sh);return isArr(v)?broadcast(v,0,(x)=>{const y=toNum(x);return isErr(y)?y:-y;}):(()=>{const y=toNum(v);return isErr(y)?y:-y;})();}
      case 'bin':{const l=ev(n.l,sheet,sh),r=ev(n.r,sheet,sh);return broadcast(l,r,(x,y)=>binop(n.o,x,y));}
      case 'fn':return call(n,sheet,sh);
    }
    throw new Error('bad node');
  }
  function call(n,sheet,sh){
    const name=n.n,A=n.args;
    if(name==='IF'){const c=toBool(scalar(ev(A[0],sheet,sh)));if(isErr(c))return c;if(c)return A[1]?ev(A[1],sheet,sh):true;return A[2]?ev(A[2],sheet,sh):false;}
    if(name==='IFERROR'){const v=ev(A[0],sheet,sh);const s=isArr(v)?v[0][0]:v;if(isErr(s))return ev(A[1],sheet,sh);return v;}
    if(name==='AND'||name==='OR'){
      let acc=name==='AND',seen=false;
      for(const a of A){const v=ev(a,sheet,sh);const vs=isArr(v)?[].concat(...v):[v];for(const x of vs){if(x===null||typeof x==='string'&&isArr(v))continue;const b=toBool(x);if(isErr(b))return b;seen=true;acc=name==='AND'?(acc&&b):(acc||b);}}
      return seen?acc:ERR('#VALUE!');}
    const f=FN[name];if(!f)throw new Error('Unknown function '+name);
    const args=A.map(a=>ev(a,sheet,sh));
    // scalar functions given arrays: only some accept arrays
    return f(args);
  }
  const scalar=v=>isArr(v)?v[0][0]:v;
  return{
    setOverrides(o){ov=o||{};cache=new Map();},
    recalc(){cache=new Map();},
    value(sheet,r,c){return cellVal(sheet,r,c);},
    cf(sheet,rule,r,c){ // returns true if rule matches at (r,c)
      const R0=rule.rg.find(g=>r>=g[0]&&r<=g[2]&&c>=g[1]&&c<=g[3]);if(!R0)return false;
      const sh={dr:r-R0[0],dc:c-R0[1]};
      try{
        if(!rule._ast)rule._ast=rule.f.map(parse);
        if(rule.t==='e'){const v=ev(rule._ast[0],sheet,sh);const x=isArr(v)?v[0][0]:v;return x===true||(typeof x==='number'&&x!==0);}
        const cv=cellVal(sheet,r,c);const fv=ev(rule._ast[0],sheet,null);const f1=isArr(fv)?fv[0][0]:fv;
        switch(rule.op){case'equal':return cmpVals(cv,f1)===0;case'notEqual':return cmpVals(cv,f1)!==0;case'greaterThan':return cmpVals(cv,f1)>0;case'lessThan':return cmpVals(cv,f1)<0;case'greaterThanOrEqual':return cmpVals(cv,f1)>=0;case'lessThanOrEqual':return cmpVals(cv,f1)<=0;}
      }catch(e){}
      return false;
    },
    isFormula(sheet,r,c){const x=S[sheet].get(r+','+c);return !!(x&&x.f);}
  };
}
Engine.fmtNum=fmtNum;Engine.isErr=isErr;Engine.toStr=toStr;
root.Engine=Engine;
if(typeof module!=='undefined')module.exports={Engine,fmtNum};
})(typeof window!=='undefined'?window:globalThis);
