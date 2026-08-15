import { $, escapeHtml, parseClock, fmtSeconds, store, toast, downloadCsv, isoDate, mean } from './utils.js';
import { EVENTS, EVENT_DATA } from './data.js';

export const PERFORMANCE_KEY='athena_performance_log_v3';
const timedEvents=EVENTS.filter(e=>!['jumps','throws'].includes(EVENT_DATA[e]?.family) && !['relay sprint','relay long sprint','relay middle distance'].includes(EVENT_DATA[e]?.family));

export function readPerformanceLog(){ return store.get(PERFORMANCE_KEY,[])||[]; }
export function writePerformanceLog(rows){ store.set(PERFORMANCE_KEY,rows.slice(-500)); }
export function addPerformanceEntry({date=isoDate(),event,result,context=''}){
  const seconds=typeof result==='number'?result:parseClock(result);
  if(!timedEvents.includes(event)) throw new Error('Choose a supported individual timed running event.');
  if(!Number.isFinite(seconds)||seconds<=0||seconds>8*3600) throw new Error('Enter a valid result such as 12.45, 2:04.20, or 18:32.');
  const rows=readPerformanceLog();
  rows.push({id:`PERF-${Date.now().toString(36)}`,date,event,seconds:Number(seconds),context:String(context||'').trim(),recordedAt:new Date().toISOString()});
  rows.sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.recordedAt).localeCompare(String(b.recordedAt)));
  writePerformanceLog(rows);return rows.at(-1);
}

export function summarizePerformance(event=null){
  const all=readPerformanceLog().filter(r=>!event||r.event===event);
  if(!all.length) return {n:0,event,availableEvents:[]};
  const chosen=event||all.at(-1).event;
  const rows=all.filter(r=>r.event===chosen).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const latest=rows.at(-1),prior=rows.slice(0,-1),vals=rows.map(r=>Number(r.seconds));
  const priorAvg=prior.length?mean(prior.map(r=>Number(r.seconds))):null;
  const allAvg=mean(vals),recent=mean(rows.slice(-3).map(r=>Number(r.seconds))),best=Math.min(...vals);
  const delta=priorAvg==null?null:latest.seconds-priorAvg;
  return {event:chosen,n:rows.length,latest,priorCount:prior.length,priorAverageSeconds:priorAvg,averageSeconds:allAvg,recent3AverageSeconds:recent,bestSeconds:best,latestVsPriorAverageSeconds:delta,latestVsPriorAveragePercent:priorAvg?delta/priorAvg*100:null,availableEvents:[...new Set(readPerformanceLog().map(r=>r.event))]};
}

function renderPerformanceLog(){
  const rows=readPerformanceLog(); const target=$('#performanceHistory'); if(!target)return;
  if(!rows.length){target.innerHTML='<p class="empty-state">No running results logged yet. Add a result here or ask Pallas how to start.</p>';$('#performanceStats').innerHTML='';return;}
  const latestEvent=rows.at(-1).event,s=summarizePerformance(latestEvent);
  const direction=s.latestVsPriorAverageSeconds==null?'Build at least two results for a personal comparison.':`${Math.abs(s.latestVsPriorAverageSeconds).toFixed(s.latest.seconds<60?2:1)}s ${s.latestVsPriorAverageSeconds<0?'faster':'slower'} than your prior average`;
  $('#performanceStats').innerHTML=`<div><small>${escapeHtml(s.event)} LATEST</small><b>${fmtSeconds(s.latest.seconds)}</b></div><div><small>PERSONAL AVG</small><b>${fmtSeconds(s.averageSeconds)}</b></div><div><small>BEST</small><b>${fmtSeconds(s.bestSeconds)}</b></div><div><small>TREND CONTEXT</small><b>${escapeHtml(direction)}</b></div>`;
  target.innerHTML=rows.slice(-8).reverse().map(r=>`<div class="performance-row"><div><b>${escapeHtml(r.event)} · ${fmtSeconds(r.seconds)}</b><span>${escapeHtml(r.date)}${r.context?` · ${escapeHtml(r.context)}`:''}</span></div><button class="text-btn" data-delete-performance="${escapeHtml(r.id)}" type="button">Delete</button></div>`).join('');
  target.querySelectorAll('[data-delete-performance]').forEach(btn=>btn.addEventListener('click',()=>{writePerformanceLog(readPerformanceLog().filter(r=>r.id!==btn.dataset.deletePerformance));renderPerformanceLog();toast('Performance entry deleted')}));
}

export function initPerformanceLog(){
  const sel=$('#performanceEvent');if(sel)sel.innerHTML=timedEvents.map(e=>`<option>${escapeHtml(e)}</option>`).join('');
  const date=$('#performanceDate');if(date&&!date.value)date.value=isoDate();
  $('#performanceForm')?.addEventListener('submit',e=>{e.preventDefault();try{addPerformanceEntry({date:$('#performanceDate').value,event:$('#performanceEvent').value,result:$('#performanceResult').value,context:$('#performanceContext').value});$('#performanceResult').value='';$('#performanceContext').value='';renderPerformanceLog();toast('Running result saved locally')}catch(err){toast(err.message)}});
  $('#exportPerformance')?.addEventListener('click',()=>downloadCsv('athena_performance_log.csv',readPerformanceLog()));
  renderPerformanceLog();
  return {render:renderPerformanceLog};
}

export function timedPerformanceEvents(){ return [...timedEvents]; }
