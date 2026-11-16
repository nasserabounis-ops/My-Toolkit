import openpyxl, json, re, ast, collections, sys, datetime
EPOCH=datetime.datetime(1899,12,30)
def ser(v):
    if isinstance(v,datetime.datetime): return (v-EPOCH).total_seconds()/86400
    if isinstance(v,datetime.date): return (datetime.datetime(v.year,v.month,v.day)-EPOCH).days
    return v
SRC='/tmp/outputs/Advisor_Toolkit.xlsx'
wbf=openpyxl.load_workbook(SRC); wbv=openpyxl.load_workbook(SRC,data_only=True)
src=open('/tmp/outputs/build_toolkit_v6.py').read()
def grab(name,start,end):
    a=src.index(start); b=src.index(end,a)
    return ast.literal_eval(src[a+len(name)+3:b+1] if False else src[src.index("[",a):b+2])
CATS=grab('CATS','CATS = [','\n]\nIDX')
IDX=grab('idx','idx = [','\n]\n')
SKIP=set()
info={a:(b,c) for a,b,c in IDX}
cats=[]
for nm,col,desc,shs in CATS:
    shs=[s for s in shs if s not in SKIP]
    if shs: cats.append({'name':nm,'color':col,'desc':desc,'sheets':[{'name':s,'what':info[s][0],'use':info[s][1]} for s in shs]})
styles=[];sidx={}
def sty(c):
    f=c.fill.fgColor.rgb if c.fill and c.fill.fill_type=='solid' and isinstance(c.fill.fgColor.rgb,str) else None
    col=c.font.color.rgb if c.font and c.font.color and isinstance(c.font.color.rgb,str) else None
    b=c.border; bd=1 if (b and b.left and b.left.style) else 0
    k=(f[2:] if f else None,col[2:] if col else None,int(bool(c.font.b)),int(bool(c.font.i)),c.font.sz if c.font.sz and c.font.sz!=10 else None,c.alignment.horizontal,c.number_format if c.number_format!='General' else None,bd,c.alignment.vertical)
    if k not in sidx: sidx[k]=len(styles); styles.append(k)
    return sidx[k]
out={}
fmts=collections.Counter(); cfs=set()
for cat in cats:
  for sh in cat['sheets']:
    ws=wbf[sh['name']]; wv=wbv[sh['name']]
    merges={}; skipc=set()
    for m in ws.merged_cells.ranges:
        if m.min_row==m.max_row:
            merges[(m.min_row,m.min_col)]=m.max_col-m.min_col+1
            for cc in range(m.min_col+1,m.max_col+1): skipc.add((m.min_row,cc))
        else:
            for rr in range(m.min_row,m.max_row+1):
                for cc in range(m.min_col,m.max_col+1):
                    if (rr,cc)!=(m.min_row,m.min_col): skipc.add((rr,cc))
    dv={}
    for d in ws.data_validations.dataValidation:
        if d.type=='list':
            for rg in str(d.sqref).split():
                for row in ws[rg] if ':' in rg else [[ws[rg]]]:
                    for c in row: dv[c.coordinate]=d.formula1
    cells=[];maxr=0;maxc=0
    for row in ws.iter_rows():
        for c in row:
            if (c.row,c.column) in skipc: continue
            v=ser(c.value)
            if isinstance(v,str) and v.startswith('=') is False and v.strip() in('<< Guide',): continue
            filled=c.fill and c.fill.fill_type=='solid'
            if v is None and not filled: continue
            isf=isinstance(v,str) and v.startswith('=')
            si=sty(c)
            if styles[si][6]: fmts[styles[si][6]]+=1
            cached=ser(wv[c.coordinate].value) if isf else None
            cells.append([c.row,c.column,(v[1:] if isf else v),1 if isf else 0,si,merges.get((c.row,c.column),1),dv.get(c.coordinate),cached])
            maxr=max(maxr,c.row);maxc=max(maxc,c.column)
    cfl=[]
    def colr(x):
        if x is None: return None
        v=getattr(x,'rgb',None)
        return v[2:] if isinstance(v,str) and len(v)==8 else None
    for cf in ws.conditional_formatting:
        rgs=[[g.min_row,g.min_col,g.max_row,g.max_col] for g in cf.sqref.ranges]
        for r in cf.rules:
            d=r.dxf
            if d is None or r.type not in('expression','cellIs'): continue
            bg=None
            if d.fill is not None: bg=colr(d.fill.bgColor) or colr(d.fill.fgColor)
            fg=colr(d.font.color) if d.font is not None and d.font.color is not None else None
            cfl.append({'rg':rgs,'t':'e' if r.type=='expression' else 'c','op':r.operator,'f':list(r.formula or []),'pr':r.priority or 99,'bg':bg,'fg':fg,'b':1 if d.font is not None and d.font.b else 0})
    cfl.sort(key=lambda x:x['pr'])
    widths={}
    for k,d in ws.column_dimensions.items():
        if d.width:
            for i in range(openpyxl.utils.column_index_from_string(d.min and openpyxl.utils.get_column_letter(d.min) or k),(d.max or d.min or 0)+1): widths[i]=d.width
    out[sh['name']]={'cells':cells,'widths':widths,'rows':maxr,'cols':maxc,'cf':cfl}
json.dump({'cats':cats,'styles':styles,'sheets':out},open('app/model.json','w'),separators=(',',':'))
print(sum(len(v['cells']) for v in out.values()),'cells',len(styles),'styles')
print(sorted(fmts.items(),key=lambda x:-x[1]))
for x in sorted(cfs): print(x)
import os;print(os.path.getsize('app/model.json')//1024,'KB')
