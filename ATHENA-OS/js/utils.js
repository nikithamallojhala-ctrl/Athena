export const $ = (s, root=document) => root.querySelector(s);
export const $$ = (s, root=document) => [...root.querySelectorAll(s)];
export const clamp = (v,min=0,max=100) => Math.min(max,Math.max(min,Number(v)));
export const round = (v,d=1) => Number(Number(v).toFixed(d));
export const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
export const median = a => { if(!a.length) return 0; const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2); return b.length%2?b[m]:(b[m-1]+b[m])/2 };
export const std = a => { if(a.length<2) return 0; const m=mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)); };
export const cv = a => mean(a) ? std(a)/mean(a) : 0;
export const uid = (prefix='athena') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
export const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

export const store = {
  get(key, fallback=null){ try{ const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v);}catch{return fallback;} },
  set(key, value){ localStorage.setItem(key,JSON.stringify(value)); return value; },
  remove(key){ localStorage.removeItem(key); },
  keys(){ return Object.keys(localStorage).filter(k=>k.startsWith('athena_')); },
  exportAll(){ const out={exportedAt:new Date().toISOString(),schema:'ATHENA_LOCAL_EXPORT_v2',items:{}}; for(const k of this.keys()) out.items[k]=this.get(k); return out; },
  clearAll(){ for(const k of this.keys()) localStorage.removeItem(k); }
};

export function toast(message){
  const el=$('#toast'); if(!el) return; el.textContent=message; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2400);
}
export function downloadText(filename,text,type='text/plain'){
  const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function downloadJson(filename,obj){ downloadText(filename,JSON.stringify(obj,null,2),'application/json'); }
export function downloadCsv(filename,rows){
  if(!rows.length) return downloadText(filename,''); const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const cell=v=>`"${String(v??'').replaceAll('"','""')}"`; const csv=[cols.map(cell).join(','),...rows.map(r=>cols.map(c=>cell(r[c])).join(','))].join('\n');
  downloadText(filename,csv,'text/csv');
}
export function fmtSeconds(sec){
  sec=Number(sec); if(!Number.isFinite(sec)) return '—'; if(sec<60) return `${sec.toFixed(2)}s`; const h=Math.floor(sec/3600),m=Math.floor((sec-h*3600)/60),s=sec-h*3600-m*60; return h?`${h}:${String(m).padStart(2,'0')}:${s.toFixed(1).padStart(4,'0')}`:`${m}:${s.toFixed(2).padStart(5,'0')}`;
}
export function parseClock(v){
  if(typeof v==='number') return v; const s=String(v).trim(); if(!s) return NaN; const p=s.split(':').map(Number); if(p.some(Number.isNaN)) return NaN; if(p.length===1)return p[0]; if(p.length===2)return p[0]*60+p[1]; if(p.length===3)return p[0]*3600+p[1]*60+p[2]; return NaN;
}
export function permutations(arr){ if(arr.length<2)return [arr]; return arr.flatMap((x,i)=>permutations([...arr.slice(0,i),...arr.slice(i+1)]).map(p=>[x,...p])); }
export function correlation(a,b){ if(a.length!==b.length||a.length<2)return 0;const ma=mean(a),mb=mean(b),num=a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0),da=Math.sqrt(a.reduce((s,x)=>s+(x-ma)**2,0)),db=Math.sqrt(b.reduce((s,x)=>s+(x-mb)**2,0));return da&&db?num/(da*db):0; }

export function drawLine(canvasOrSelector, series, options={}){
  const canvas=typeof canvasOrSelector==='string'?$(canvasOrSelector):canvasOrSelector;if(!canvas)return;
  const ctx=canvas.getContext('2d'); const rect=canvas.getBoundingClientRect(); const dpr=Math.min(window.devicePixelRatio||1,2); canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));ctx.scale(dpr,dpr);
  const w=rect.width,h=rect.height,p={l:38,r:16,t:18,b:30};ctx.clearRect(0,0,w,h); if(!series.length)return;
  const vals=series.map(x=>Number(x.value)).filter(Number.isFinite),min=options.min??Math.min(...vals)-3,max=options.max??Math.max(...vals)+3; const range=Math.max(max-min,1);
  const css=getComputedStyle(document.body),line=css.getPropertyValue('--line').trim()||'#244',muted=css.getPropertyValue('--muted').trim()||'#899',accent=css.getPropertyValue(options.colorVar||'--accent').trim()||'#7df';
  ctx.strokeStyle=line;ctx.lineWidth=1;ctx.fillStyle=muted;ctx.font='10px system-ui';
  for(let i=0;i<4;i++){const y=p.t+(h-p.t-p.b)*i/3;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();const label=(max-(range*i/3)).toFixed(0);ctx.fillText(label,4,y+3)}
  const x=i=>p.l+(w-p.l-p.r)*(series.length===1?.5:i/(series.length-1)),y=v=>p.t+(h-p.t-p.b)*(1-(v-min)/range);
  ctx.beginPath(); series.forEach((d,i)=>{const xx=x(i),yy=y(d.value);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.strokeStyle=accent;ctx.lineWidth=2.2;ctx.stroke();
  series.forEach((d,i)=>{ctx.beginPath();ctx.arc(x(i),y(d.value),3,0,Math.PI*2);ctx.fillStyle=accent;ctx.fill()});
  const labelEvery=Math.max(1,Math.ceil(series.length/6)); series.forEach((d,i)=>{if(i%labelEvery===0||i===series.length-1){ctx.fillStyle=muted;ctx.fillText(String(d.label??i+1).slice(0,10),Math.max(2,x(i)-16),h-8)}})
}
export function sparklineSvg(values,width=160,height=42){
  if(!values?.length)return '';const mn=Math.min(...values),mx=Math.max(...values),r=Math.max(mx-mn,1e-6),pts=values.map((v,i)=>`${(i/(values.length-1||1)*width).toFixed(1)},${(height-(v-mn)/r*height).toFixed(1)}`).join(' ');return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
export function speak(text){ if(!('speechSynthesis'in window))return false; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=1.02;speechSynthesis.speak(u);return true; }
export function debounce(fn,ms=100){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms)}};
export function isoDate(d=new Date()){ return new Date(d).toISOString().slice(0,10); }
