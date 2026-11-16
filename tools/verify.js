const {Engine}=require('./src/engine.js');
const model=require('./app/model.json');
if(process.env.DBG)Engine.debug=true;
Engine.fixedToday=46338;
const eng=Engine(model);
let bad=0,tot=0;const byS={};
for(const [name,sh] of Object.entries(model.sheets)){
  for(const c of sh.cells){
    if(c[3]!==1)continue; tot++;
    let v=eng.value(name,c[0],c[1]); const x=c[7];
    if(v&&typeof v==='object'&&'err' in v)v=v.err;
    let ok;
    if(typeof x==='number'&&typeof v==='number') ok=Math.abs(x-v)<=1e-6*Math.max(1,Math.abs(x));
    else if(x===null||x===undefined) ok=(v===null||v==='');
    else if(typeof x==='boolean') ok=(v===x);
    else ok=(String(x)===String(v));
    if(!ok){bad++;(byS[name]=byS[name]||[]).push([c[0],c[1],c[2].slice(0,80),x,v]);}
  }
}
console.log('formulas',tot,'mismatch',bad);
for(const [k,v] of Object.entries(byS)){console.log(k,v.length);v.slice(0,5).forEach(z=>console.log('  ',JSON.stringify(z)));}
