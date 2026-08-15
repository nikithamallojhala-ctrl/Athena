import { $, escapeHtml, fmtSeconds, store, toast, isoDate } from './utils.js';
import { EVENTS } from './data.js';
import { addPerformanceEntry, summarizePerformance, timedPerformanceEvents } from './performance-log.js';

const CHAT_KEY='athena_pallas_chat_v1';
const STATE_KEY='athena_state_history_v2';
const NAV=[
  {keys:['profile','event genome','baseline pulse'],label:'Athlete profile',anchor:'#command',tip:'Set your event, level, age, and baseline resting pulse in Command Center.'},
  {keys:['check in','check-in','sleep','soreness','stress','hydration','readiness','state'],label:'Daily check-in',anchor:'#command',tip:'Complete the Daily check-in in Command Center, then save the state update.'},
  {keys:['sprint','race plan','acceleration'],label:'Sprint Architect',anchor:'#eventlab',tip:'Open Event Lab → Sprints for acceleration/transition/max-velocity planning.'},
  {keys:['hurdle','rhythm'],label:'Rhythm Engine',anchor:'#eventlab',tip:'Open Event Lab → Hurdles for rhythm calculations.'},
  {keys:['pace','split','800','1500','1600','3200','5000'],label:'Pace Matrix',anchor:'#eventlab',tip:'Open Event Lab → Distance for goal splits and pacing strategy.'},
  {keys:['jump','flight log'],label:'Flight Log',anchor:'#eventlab',tip:'Open Event Lab → Jumps to record attempts and consistency.'},
  {keys:['throw','shot','discus','javelin','hammer'],label:'Throw Vault',anchor:'#eventlab',tip:'Open Event Lab → Throws to record series and consistency.'},
  {keys:['relay','4x100','4x400','order'],label:'Relay Intelligence',anchor:'#eventlab',tip:'Open Event Lab → Relays to evaluate all 24 orders for four athletes.'},
  {keys:['research','experiment','ablation','validation','model'],label:'Research Studio',anchor:'#research',tip:'Research Studio contains public-data validation, model comparisons, failures, N-of-1 tools, and prospective validation.'},
  {keys:['health','heat','head','breathing','chest','sbar','handoff'],label:'Health + Handoff',anchor:'#health',tip:'Use Health + Handoff for educational safety guidance and structured SBAR communication. ATHENA does not diagnose or clear athletes.'},
  {keys:['performance log','race log','running history','results'],label:'Performance Log',anchor:'#intelligence',tip:'Use Performance Log in Intelligence to save running results locally; Pallas can compare them with your own history.'},
  {keys:['method','math','source','citation','data'],label:'Methods',anchor:'#methods',tip:'Methods shows equations, dataset boundaries, provenance, feasibility, and reproducibility.'}
];

function messages(){return store.get(CHAT_KEY,[])||[]}
function saveMessages(rows){store.set(CHAT_KEY,rows.slice(-24))}
function stateHistory(){return store.get(STATE_KEY,[])||[]}
function findEvent(text){const q=text.toLowerCase();return [...EVENTS].sort((a,b)=>b.length-a.length).find(e=>q.includes(e.toLowerCase()))||null}
function navMatch(q){return NAV.find(x=>x.keys.some(k=>q.includes(k)))}
function link(label,anchor){return `<a class="pallas-link" href="${anchor}">${escapeHtml(label)} →</a>`}
function stateAnswer(current){
  if(!current)return `I don’t have a current ATHENA state yet. Complete the daily check-in and save a state update. ${link('Open Command Center','#command')}`;
  const flag=current.safety?.override?` A safety override is active: ${escapeHtml(current.safety.message)}`:'';
  return `Your current ATHENA state is <b>${current.score}/100 (${escapeHtml(current.label)})</b> with <b>${current.confidence}% confidence</b>. Best-fit label: <b>${escapeHtml(current.bestFit)}</b>.${flag} ${link('See the full state','#command')}`;
}
function stateTrendAnswer(){
  const h=stateHistory();if(h.length<3)return `I need at least 3 saved state updates before I can describe a personal state trend. You currently have ${h.length}.`;
  const recent=h.slice(-3).map(x=>Number(x.score));const prior=h.slice(0,-3).slice(-7).map(x=>Number(x.score));
  const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;const r=avg(recent);if(!prior.length)return `Your last 3 saved state scores average <b>${r.toFixed(1)}</b>. Add more history and I’ll compare that against an earlier personal baseline.`;
  const p=avg(prior),d=r-p;return `Your last 3 saved state scores average <b>${r.toFixed(1)}</b> versus <b>${p.toFixed(1)}</b> across the preceding ${prior.length} saved updates — <b>${Math.abs(d).toFixed(1)} points ${d>=0?'higher':'lower'}</b>. This is descriptive personal history, not a medical interpretation.`;
}
function performanceAnswer(event){
  const s=summarizePerformance(event);if(!s.n)return `I don’t have saved running results${event?` for ${escapeHtml(event)}`:''} yet. Add them in Performance Log; everything stays in this browser. ${link('Open Performance Log','#performanceLog')}`;
  if(s.priorCount<2)return `Your latest ${escapeHtml(s.event)} is <b>${fmtSeconds(s.latest.seconds)}</b>. I need at least 2 earlier ${escapeHtml(s.event)} results for a useful personal-average comparison.`;
  const d=s.latestVsPriorAverageSeconds,p=s.latestVsPriorAveragePercent;return `Your latest ${escapeHtml(s.event)} was <b>${fmtSeconds(s.latest.seconds)}</b>. Your earlier-result average was <b>${fmtSeconds(s.priorAverageSeconds)}</b>, so the latest result was <b>${Math.abs(d).toFixed(s.latest.seconds<60?2:1)}s (${Math.abs(p).toFixed(1)}%) ${d<0?'faster':'slower'}</b> than that prior average. Your best saved result is <b>${fmtSeconds(s.bestSeconds)}</b>.`;
}
function whyAnswer(current){
  if(!current)return stateAnswer(current);
  const factors=[...(current.factors||[])].sort((a,b)=>a.value-b.value);const low=factors.slice(0,2);const dev=(current.deviationFlags||[]).slice(0,2);
  return `The biggest downward context in today’s state is ${low.map(x=>`<b>${escapeHtml(x.name)} ${x.value}/100</b>`).join(' and ')||'not available'}. ${dev.length?`Personal-pattern flags: ${dev.map(x=>escapeHtml(`${x.label} ${x.direction}`)).join(', ')}. `:''}ATHENA treats these as model inputs, not proven causes. ${link('Open Explainability','#intelligence')}`;
}
function helpAnswer(q){const m=navMatch(q);if(m)return `${escapeHtml(m.tip)} ${link(`Go to ${m.label}`,m.anchor)}`;return `I can help with navigation, ATHENA’s current state, personal trends, saved running results, research/methods, and troubleshooting. Try “Why is my state lower?”, “Am I slower than my average in the 100m?”, or “Where is Relay Intelligence?”`;}
function troubleshoot(){return `Try these in order: <b>1)</b> refresh the page, <b>2)</b> make sure you’re using the GitHub Pages/static-site URL rather than opening index.html directly, <b>3)</b> confirm browser storage is allowed, and <b>4)</b> export local data before using the reset button in About. If one specific ATHENA tool is failing, tell me its name and I’ll point you to the relevant section.`}
function tryLogCommand(raw){
  const q=raw.trim();if(!/^log\b/i.test(q))return null;const event=findEvent(q);if(!event||!timedPerformanceEvents().includes(event))return `I can log individual timed running events. Try: <b>log 100m 12.45</b> or use Performance Log.`;
  const after=q.toLowerCase().replace(/^log\s+/,'').replace(event.toLowerCase(),'').trim();const match=after.match(/(?:\d+:)?\d+(?::\d+(?:\.\d+)?)?|\d+(?:\.\d+)?/);if(!match)return `I found ${escapeHtml(event)}, but I still need a result. Example: <b>log ${escapeHtml(event)} 12.45</b>.`;
  try{const entry=addPerformanceEntry({date:isoDate(),event,result:match[0],context:'Logged through Pallas'});return `Saved <b>${escapeHtml(event)} · ${fmtSeconds(entry.seconds)}</b> for today in your local Performance Log. ${link('View history','#performanceLog')}`}catch(err){return escapeHtml(err.message)}
}

function answer(raw,getCurrentState){
  const q=raw.toLowerCase().replace(/[’']/g,"'");
  const log=tryLogCommand(raw);if(log)return log;
  if(/not working|broken|error|won't|doesn't work|troubleshoot/.test(q))return troubleshoot();
  if(/average|usual|trend|faster|slower|running below|running above|performance lately|race time/.test(q))return performanceAnswer(findEvent(q));
  if(/state trend|readiness trend|lately|recent state/.test(q))return stateTrendAnswer();
  if(/why.*(state|readiness)|what.*affect|lower today|higher today/.test(q))return whyAnswer(getCurrentState());
  if(/what.*(state|readiness)|how.*(ready|readiness)|today.*state|what should i do today/.test(q))return stateAnswer(getCurrentState());
  if(/diagnos|injury|medical|clearance/.test(q))return `Pallas can explain ATHENA and point to safety information, but it does not diagnose injuries or give medical clearance. ${link('Open Health + Handoff','#health')}`;
  return helpAnswer(q);
}

function renderPallas(){
  const el=$('#pallasMessages');if(!el)return;const rows=messages();el.innerHTML=(rows.length?rows:[{role:'assistant',html:'Hi — I’m <b>Pallas</b>, ATHENA’s local guide. Ask me where something is, why a state changed, or how your saved running results compare with your own history.'}]).map(m=>`<div class="pallas-message ${m.role}"><span>${m.role==='assistant'?'PALLAS':'YOU'}</span><div>${m.html||escapeHtml(m.text||'')}</div></div>`).join('');el.scrollTop=el.scrollHeight;
}
function add(role,content,isHtml=false){const rows=messages();rows.push(isHtml?{role,html:content}:{role,text:content});saveMessages(rows);renderPallas();}
function setOpen(open){const panel=$('#pallasPanel'),btn=$('#pallasToggle');if(!panel)return;panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));btn?.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>$('#pallasInput')?.focus(),50)}

export function initPallas(getCurrentState){
  $('#pallasToggle')?.addEventListener('click',()=>setOpen(!$('#pallasPanel')?.classList.contains('open')));
  $('#pallasClose')?.addEventListener('click',()=>setOpen(false));
  $('#pallasClear')?.addEventListener('click',()=>{store.remove(CHAT_KEY);renderPallas();toast('Pallas chat cleared locally')});
  $('#pallasForm')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#pallasInput'),raw=input.value.trim();if(!raw)return;add('user',escapeHtml(raw),true);input.value='';const out=answer(raw,getCurrentState);setTimeout(()=>add('assistant',out,true),60)});
  document.querySelectorAll('[data-pallas-prompt]').forEach(btn=>btn.addEventListener('click',()=>{const text=btn.dataset.pallasPrompt;$('#pallasInput').value=text;$('#pallasForm').requestSubmit()}));
  document.addEventListener('click',e=>{const a=e.target.closest('.pallas-link');if(a)setOpen(false)});
  renderPallas();
  return {open:()=>setOpen(true),answer:q=>answer(q,getCurrentState)};
}
