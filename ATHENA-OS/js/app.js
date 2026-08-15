import { $, $$, clamp, round, mean, std, store, toast, downloadJson, downloadCsv, escapeHtml, drawLine, speak, debounce, isoDate, fmtSeconds } from './utils.js';
import { EVENTS, EVENT_DATA, DEMAND_LABELS } from './data.js';
import { STATE_VERSION, computeState, sessionCompatibility, counterfactual, stateDimensionLabels } from './state-engine.js';
import { buildSprintBlueprint, buildHurdleRhythm, buildPaceMatrix, formatPaceRows, summarizeAttempts, optimizeRelay, relaySensitivity } from './event-tools.js';
import { heatContext, heartRateGuide, sleepSummary, concernInfo, SYMPTOMS, buildSBAR } from './health.js';
import { loadResearchData, bindResearchUI, getResearchData } from './research-ui.js';
import { initProspective } from './prospective.js';
import { initPerformanceLog } from './performance-log.js';
import { initPallas } from './pallas.js';

const KEY={profile:'athena_profile_v2',history:'athena_state_history_v2',jumps:'athena_jump_log_v2',throws:'athena_throw_log_v2',sleep:'athena_sleep_bank_v2',protocol:'athena_nof1_protocol_v2',observations:'athena_nof1_observations_v2',theme:'athena_theme_v2'};
const DIM_LABELS=stateDimensionLabels();
let currentState=null,currentCompatibility=null,voiceEnabled=false,prospectiveController=null,pallasController=null;

function init(){
  initShell(); initProfile(); initStateEngine(); initEventLab(); initIntelligence(); initPerformanceLog(); initResearchNof1(); initHealth(); initHandoff(); bindResearchUI(); prospectiveController=initProspective(()=>currentState); pallasController=initPallas(()=>currentState);
  loadResearchData().then(()=>updateResearchDependent());
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}

function initShell(){
  const savedTheme=store.get(KEY.theme,'dark'); document.body.classList.toggle('light',savedTheme==='light');
  $('#themeToggle')?.addEventListener('click',()=>{const light=document.body.classList.toggle('light');store.set(KEY.theme,light?'light':'dark');renderTrajectory();renderResearchChart()});
  $('#mobileMenu')?.addEventListener('click',()=>{const open=$('#primaryNav').classList.toggle('open');$('#mobileMenu').setAttribute('aria-expanded',String(open))});
  $$('#primaryNav a').forEach(a=>a.addEventListener('click',()=>{$('#primaryNav').classList.remove('open');$('#mobileMenu').setAttribute('aria-expanded','false')}));
  $('#voiceToggle')?.addEventListener('click',()=>{voiceEnabled=!voiceEnabled;$('#voiceToggle').setAttribute('aria-pressed',String(voiceEnabled));$('#voiceToggle').textContent=voiceEnabled?'VOICE ON':'VOICE';toast(voiceEnabled?'Voice summaries enabled':'Voice summaries disabled')});
  const setGuide=open=>{const drawer=$('#guideDrawer'),backdrop=$('#guideBackdrop'),toggle=$('#guideToggle');if(!drawer||!backdrop)return;drawer.classList.toggle('open',open);drawer.setAttribute('aria-hidden',String(!open));backdrop.hidden=!open;toggle?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('guide-open',open);};
  $('#guideToggle')?.addEventListener('click',()=>setGuide(!$('#guideDrawer')?.classList.contains('open')));
  $('#startGuide')?.addEventListener('click',()=>setGuide(true));
  $('#closeGuide')?.addEventListener('click',()=>setGuide(false));
  $('#guideBackdrop')?.addEventListener('click',()=>setGuide(false));
  $$('[data-guide-link]').forEach(a=>a.addEventListener('click',()=>setGuide(false)));
  window.addEventListener('keydown',e=>{if(e.key==='Escape')setGuide(false)});
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.08}); $$('.reveal').forEach(el=>observer.observe(el));
  let last=0;window.addEventListener('scroll',()=>{const y=scrollY;$('#topbar')?.classList.toggle('scrolled',y>20);last=y},{passive:true});
  $('#resetLocalData')?.addEventListener('click',()=>{if(confirm('Delete all ATHENA data stored in this browser? This cannot be undone.')){store.clearAll();toast('ATHENA local data deleted');setTimeout(()=>location.reload(),350)}});
}

function initProfile(){
  $$('.event-select').forEach(sel=>{sel.innerHTML=EVENTS.map(e=>`<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`).join('')});
  const p=store.get(KEY.profile,{name:'',age:16,level:'High school',primaryEvent:'100m',secondaryEvent:'200m',baselineHr:68});
  $('#athleteName').value=p.name||'';$('#athleteAge').value=p.age||16;$('#athleteLevel').value=p.level||'High school';$('#primaryEvent').value=EVENTS.includes(p.primaryEvent)?p.primaryEvent:'100m';$('#secondaryEvent').value=EVENTS.includes(p.secondaryEvent)?p.secondaryEvent:'200m';$('#baselineHr').value=p.baselineHr||68;$('#restingHr').value=p.baselineHr||68;
  renderEventDemand();
  $('#saveProfile').addEventListener('click',()=>{store.set(KEY.profile,readProfile());toast('Athlete profile saved locally');renderEventDemand();updateStatePreview()});
  $('#exportAthleteData').addEventListener('click',()=>downloadJson('athena_local_athlete_export.json',store.exportAll()));
  ['primaryEvent','secondaryEvent','athleteAge','baselineHr'].forEach(id=>$('#'+id)?.addEventListener('change',()=>{renderEventDemand();updateStatePreview()}));
}
function readProfile(){return {name:$('#athleteName').value.trim(),age:Number($('#athleteAge').value),level:$('#athleteLevel').value,primaryEvent:$('#primaryEvent').value,secondaryEvent:$('#secondaryEvent').value,baselineHr:Number($('#baselineHr').value)}}
function renderEventDemand(){
  const e=$('#primaryEvent').value||'100m',info=EVENT_DATA[e]||EVENT_DATA['100m'];$('#eventBias').textContent=`${info.family} · event-aware`;
  $('#eventDemandViz').innerHTML=Object.entries(info.demands).map(([k,v])=>`<div class="demand-item"><span>${escapeHtml(DEMAND_LABELS[k]||k)}</span><b>${Math.round(v*100)}</b><div class="demand-bar"><i style="width:${Math.round(v*100)}%"></i></div></div>`).join('');
}

function initStateEngine(){
  const rangeFormats={sleep:v=>`${Number(v).toFixed(1)} h`,energy:v=>`${v} / 10`,soreness:v=>`${v} / 10`,stress:v=>`${v} / 10`,load:v=>`${v} / 10`,sessionIntensity:v=>`${v} / 10`};
  Object.entries(rangeFormats).forEach(([id,fmt])=>{const input=$('#'+id),out=$('#'+(id==='sessionIntensity'?'intensityOut':id+'Out'));if(input&&out){const run=()=>{out.value=fmt(input.value);out.textContent=fmt(input.value);updateStatePreview()};input.addEventListener('input',run);run()}});
  ['hydration','restingHr','healthFlag'].forEach(id=>$('#'+id)?.addEventListener('input',updateStatePreview));
  ['plannedSession','sessionDuration','sessionTemp'].forEach(id=>$('#'+id)?.addEventListener('input',updateSession));
  $('#saveCheckin').addEventListener('click',()=>{const profile=readProfile();store.set(KEY.profile,profile);const state=computeState(profile,readObservation(),getHistory());const hist=getHistory();hist.push(state);store.set(KEY.history,hist.slice(-180));currentState=state;renderState(state);renderTrajectory();updateSession();updateCounterfactual();toast('State update saved locally')});
  $('#speakSummary').addEventListener('click',()=>currentState&&speakState(currentState));
  $('#seedDemoHistory').addEventListener('click',seedDemoHistory);
  $('#clearHistory').addEventListener('click',()=>{if(confirm('Reset locally stored ATHENA state history?')){store.remove(KEY.history);renderTrajectory();updateStatePreview();toast('State history reset')}});
  $$('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.mode-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.body.classList.toggle('technical-mode',btn.dataset.commandMode==='technical')}));
  $('#stateVersion').textContent=STATE_VERSION.replace('ATHENA_STATE_','').replaceAll('_','.');
  updateStatePreview();renderTrajectory();
}
function readObservation(){return {sleep:Number($('#sleep').value),energy:Number($('#energy').value),soreness:Number($('#soreness').value),stress:Number($('#stress').value),hydration:Number($('#hydration').value),restingHr:Number($('#restingHr').value),load:Number($('#load').value),healthFlag:$('#healthFlag').value}}
function getHistory(){return store.get(KEY.history,[])||[]}
function updateStatePreview(){
  currentState=computeState(readProfile(),readObservation(),getHistory()); renderState(currentState);updateSession();updateCounterfactual();prospectiveController?.render();
}
function renderState(s){
  $('#readinessRing').style.setProperty('--score',s.score);$('#readinessScore').textContent=s.score;$('#readinessLabel').textContent=s.provisional&&!s.safety.override?'PROVISIONAL':s.label;$('#readinessSummary').textContent=s.safety.override?s.safety.message:`${s.label} state for ${s.event}. ${s.provisional?'Personal history is still sparse.':''}`;$('#bestFit').innerHTML=`<small>BEST-FIT SESSION</small><b>${escapeHtml(s.bestFit)}</b>`;$('#confidenceFill').style.width=`${s.confidence}%`;$('#confidenceText').textContent=`${s.confidence}%`;
  $('#heroStateScore').textContent=s.score;$('#heroRecovery').textContent=Math.round(s.dimensions.recovery);$('#heroLoad').textContent=Math.round(s.dimensions.loadTolerance);$('#heroConfidence').textContent=`${s.confidence}%`;
  $('#stateDimensions').innerHTML=Object.entries(s.dimensions).map(([k,v])=>`<div class="state-dimension"><small>${escapeHtml(DIM_LABELS[k]||k)}</small><b>${Math.round(v)}</b></div>`).join('');
  const flags=[];if(s.provisional)flags.push(['warn','Sparse personal history']);if(s.confidence<55)flags.push(['warn','Low confidence']);if(s.safety.override)flags.push(['danger','Safety override']);(s.deviationFlags||[]).slice(0,2).forEach(x=>flags.push(['warn',`${x.label}: ${x.direction} personal pattern`]));if(!flags.length)flags.push(['','No model-level warning flags']);
  $('#stateFlags').innerHTML=flags.map(([c,t])=>`<span class="state-flag ${c}">${escapeHtml(t)}</span>`).join('');
  $('#factorGrid').innerHTML=s.factors.map(f=>`<div class="factor"><small>${escapeHtml(f.name)}</small><b>${f.value}/100</b><span>${escapeHtml(f.detail)}</span></div>`).join('');
  $('#recommendations').innerHTML=s.recommendations.map(r=>`<span title="${escapeHtml(r.text)}">${escapeHtml(r.title)} · ${escapeHtml(r.text)}</span>`).join('');
  const x=s.explanation;const personal=(s.personalBaseline?.deviations||[]);$('#stateMethodExplain').innerHTML=`<p><code>${escapeHtml(x.formula)}</code></p><p><b>Event context:</b> ${escapeHtml(x.eventFamily)}. History depth: ${x.historyDepth}. Temporal smoothing λ: ${x.smoothingLambda}.</p><p><b>Personal-pattern context:</b> ${personal.length?personal.map(v=>escapeHtml(v.message)).join(' '):s.personalBaseline?.nHistory>=3?'No ≥2 SD deviations detected in the recent local-history window.':'At least 3 prior check-ins are needed for personal-pattern context.'}</p><p>${escapeHtml(x.boundary)}</p>`;
  $('#explainabilityBars').innerHTML=[...s.factors].sort((a,b)=>b.value-a.value).map(f=>`<div class="explain-row"><span>${escapeHtml(f.name)}</span><div class="explain-track"><i style="width:${f.value}%"></i></div><b>${f.value}</b></div>`).join('');
  $('#provenanceCard').innerHTML=[['State model',s.version],['Updated',new Date(s.timestamp).toLocaleString()],['Primary event',s.event],['History depth',String(s.explanation.historyDepth)],['Smoothing λ',String(s.explanation.smoothingLambda)],['Confidence',`${s.confidence}%`],['Data location','Browser local state; no remote athlete-data API']].map(([a,b])=>`<div class="provenance-row"><span>${a}</span><b>${escapeHtml(b)}</b></div>`).join('');
  $('#abstentionCard').innerHTML=s.safety.override?`<b>Performance model abstains.</b><p>${escapeHtml(s.safety.message)}</p>`:s.confidence<50?`<b>Not enough personal evidence yet.</b><p>ATHENA keeps the estimate provisional while local history is sparse. Build history rather than interpreting one check-in as certainty.</p>`:`<b>Model active with ${s.confidence}% confidence.</b><p>ATHENA still exposes uncertainty and never treats this score as medical clearance.</p>`;
}
function speakState(s){speak(`ATHENA state ${s.score}. ${s.label}. ${s.bestFit}. Confidence ${s.confidence} percent. ${s.safety.override?s.safety.message:'This is a planning aid, not medical clearance.'}`)}
function updateSession(){
  if(!currentState)return;currentCompatibility=sessionCompatibility(currentState,{session:$('#plannedSession').value,intensity:Number($('#sessionIntensity').value),duration:Number($('#sessionDuration').value),temp:Number($('#sessionTemp').value)});
  const c=currentCompatibility;$('#compatibilityScore').textContent=c.stateAware==null?'—':c.stateAware;$('#compatibilityFill').style.width=`${c.stateAware??0}%`;$('#compatibilityLabel').textContent=c.label;$('#compatibilityText').textContent=c.text;$('#compatBaseline').textContent=c.baseline;$('#compatState').textContent=c.stateAware??'ABSTAIN';$('#compatUncertainty').textContent=`${c.uncertainty}%`;$('#sessionAdjustments').innerHTML=c.adjustments.map(x=>`<div>${escapeHtml(x)}</div>`).join('');
}
function renderTrajectory(){
  const h=getHistory(),canvas=$('#trendChart'),empty=$('#chartEmpty'); if(!h.length){empty.hidden=false;drawLine(canvas,[]);$('#trajectoryStats').innerHTML='';return} empty.hidden=true;
  drawLine(canvas,h.map((x,i)=>({label:new Date(x.timestamp).toLocaleDateString(undefined,{month:'short',day:'numeric'}),value:x.score})),{min:0,max:100});
  const vals=h.map(x=>Number(x.score));const recent=vals.slice(-7);const trend=recent.length>1?recent.at(-1)-recent[0]:0;$('#trajectoryStats').innerHTML=[['CHECK-INS',h.length],['RECENT AVG',round(mean(recent),1)],['7-POINT CHANGE',`${trend>=0?'+':''}${round(trend,1)}`],['LATEST CONF.',`${h.at(-1).confidence}%`]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('');
}
function seedDemoHistory(){
  const p=readProfile(),obs=readObservation(),hist=[];for(let i=8;i>=1;i--){const o={...obs,sleep:clamp(obs.sleep+Math.sin(i)*.7,5,10),energy:clamp(obs.energy+Math.cos(i)*1.2,2,10),soreness:clamp(obs.soreness+Math.sin(i*.8)*1.3,0,9),stress:clamp(obs.stress+Math.cos(i*.6)*1.1,0,9),restingHr:Math.round(obs.restingHr+Math.sin(i*.9)*3),load:clamp(obs.load+Math.cos(i)*2,0,10),healthFlag:'none'};const s=computeState(p,o,hist);const t=new Date();t.setDate(t.getDate()-i);s.timestamp=t.toISOString();s.demoSynthetic=true;hist.push(s)}store.set(KEY.history,hist);renderTrajectory();updateStatePreview();toast('Synthetic demo history loaded — not research evidence')
}

function initEventLab(){
  $$('.lab-tab').forEach(btn=>btn.addEventListener('click',()=>{$$('.lab-tab').forEach(x=>x.classList.remove('active'));$$('.lab-pane').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#pane-'+btn.dataset.pane).classList.add('active')}));
  $('#buildSprintPlan').addEventListener('click',renderSprint);$('#buildHurdlePlan').addEventListener('click',renderHurdles);$('#buildPacePlan').addEventListener('click',renderPace);
  initAttemptLog('jump');initAttemptLog('throw');initRelay();renderSprint();renderHurdles();renderPace();
}
function renderSprint(){try{const rows=buildSprintBlueprint($('#sprintEvent').value,$('#sprintGoal').value,$('#sprintStrength').value);$('#sprintBlueprint').innerHTML=`<div class="blueprint-title"><div><small>RACE PHASE MODEL</small><h3>${$('#sprintEvent').value}m</h3></div><strong>${Number($('#sprintGoal').value).toFixed(2)}s</strong></div><div class="phase-list">${rows.map(r=>`<div><small>${r.start}–${r.end}m</small><b>${escapeHtml(r.name)} · ${r.time.toFixed(2)}s</b><span>${escapeHtml(r.cue)}</span></div>`).join('')}</div><p class="fine-print">Transparent allocation heuristic. It does not estimate individual biomechanics or guarantee a race outcome.</p>`}catch(e){toast(e.message)}}
function renderHurdles(){try{const r=buildHurdleRhythm($('#hurdleEvent').value,$('#hurdleGoal').value,$('#hurdleAllowance').value);$('#hurdleBlueprint').innerHTML=`<div class="blueprint-title"><div><small>RHYTHM MODEL</small><h3>${escapeHtml(r.event)}</h3></div><strong>${r.intervalTarget.toFixed(3)}s</strong></div><div class="phase-list">${r.checkpoints.map(x=>`<div><small>${escapeHtml(x.label)} · ${x.distance}m</small><b>${x.time.toFixed(2)}s</b><span>cumulative ${x.cumulative.toFixed(2)}s</span></div>`).join('')}</div><p class="fine-print">${escapeHtml(r.assumption)}</p>`}catch(e){toast(e.message)}}
function renderPace(){try{const m=buildPaceMatrix($('#distanceEvent').value,$('#distanceGoal').value,$('#distanceStrategy').value),rows=formatPaceRows(m);$('#distanceBlueprint').innerHTML=`<div class="blueprint-title"><div><small>${escapeHtml(m.strategy.toUpperCase())} STRATEGY</small><h3>${m.distance}m pace matrix</h3></div><strong>${fmtSeconds(m.goal)}</strong></div><div class="phase-list">${rows.map((x,i)=>`<div><small>SEG ${i+1} · ${x.distance}m</small><b>${x.splitText}</b><span>${x.cumulativeText} cumulative · ${x.paceText}/400m</span></div>`).join('')}</div><p class="fine-print">Segment weights are normalized so displayed splits sum exactly to the entered goal.</p>`}catch(e){toast(e.message)}}
function initAttemptLog(kind){
  const jump=kind==='jump',key=jump?KEY.jumps:KEY.throws,prefix=jump?'jump':'throw';
  const render=()=>{const attempts=store.get(key,[]),s=summarizeAttempts(attempts);$('#'+prefix+'Stats').innerHTML=[['ATTEMPTS',s.count],['LEGAL',s.legalCount],['BEST',s.best==null?'—':`${s.best.toFixed(2)}m`],['CONSISTENCY',s.consistency==null?'—':`${s.consistency}/100`]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('');$('#'+prefix+'Series').innerHTML=attempts.map((a,i)=>`<div class="attempt ${a.foul?'foul':''}"><small>#${i+1} · ${escapeHtml(a.event)}</small><b>${a.foul?'FOUL / MISS':`${Number(a.mark).toFixed(2)}m`}</b></div>`).join('');$('#'+prefix+'Trend').textContent=s.legalCount<2?'Add at least two legal marks for consistency/trend analysis.':`Legal mean ${s.mean.toFixed(2)}m · SD ${s.sd.toFixed(3)}m · CV ${s.cv.toFixed(2)}% · half-to-half trend ${s.trend>=0?'+':''}${s.trend.toFixed(2)}m.`};
  $('#add'+(jump?'Jump':'Throw')).addEventListener('click',()=>{const mark=Number($('#'+prefix+'Mark').value),foul=$('#'+prefix+'Foul').checked;if(!foul&&(!Number.isFinite(mark)||mark<=0))return toast('Enter a positive mark or select foul/miss');const rows=store.get(key,[]);rows.push({event:$('#'+prefix+'Event').value,mark:foul?null:mark,foul,date:new Date().toISOString()});store.set(key,rows.slice(-100));$('#'+prefix+'Mark').value='';$('#'+prefix+'Foul').checked=false;render()});
  $('#reset'+(jump?'Jumps':'Throws')).addEventListener('click',()=>{store.remove(key);render()});$('#export'+(jump?'Jumps':'Throws')).addEventListener('click',()=>downloadCsv(`athena_${kind}_series.csv`,store.get(key,[])));render();
}
function initRelay(){
  const defaults=[['Avery',52.4,8,8,8,7],['Blake',51.9,6,9,8,8],['Casey',52.1,9,7,9,7],['Drew',52.7,7,8,9,10]];
  $('#relayAthletes').innerHTML=defaults.map((d,i)=>`<div class="relay-athlete" data-i="${i}"><h4>Athlete ${i+1}</h4><div class="mini-fields"><input aria-label="Athlete ${i+1} name" class="r-name" value="${d[0]}"><input aria-label="Athlete ${i+1} reference time" class="r-time" type="number" step=".01" value="${d[1]}" title="Reference time"><input aria-label="Athlete ${i+1} curve rating" class="r-curve" type="number" min="1" max="10" value="${d[2]}" title="Curve 1-10"><input aria-label="Athlete ${i+1} exchange rating" class="r-exchange" type="number" min="1" max="10" value="${d[3]}" title="Exchange 1-10"><input aria-label="Athlete ${i+1} endurance rating" class="r-endurance" type="number" min="1" max="10" value="${d[4]}" title="Endurance 1-10"><input aria-label="Athlete ${i+1} pressure rating" class="r-pressure" type="number" min="1" max="10" value="${d[5]}" title="Pressure 1-10"></div><small>time · curve · exchange · endurance · pressure</small></div>`).join('');
  $('#relayMath').innerHTML='<p><code>min Σ reference_timeᵢ + role_fit_penalty(i, leg) + exchange_risk</code></p><p>ATHENA evaluates every 4! = 24 assignment. With four fixed runners, exact enumeration is faster and more auditable than introducing an optimizer that cannot improve solution quality.</p>';
  $('#optimizeRelay').addEventListener('click',renderRelay);
}
function readRelay(){return $$('.relay-athlete').map(el=>({name:$('.r-name',el).value.trim(),time:Number($('.r-time',el).value),curve:Number($('.r-curve',el).value),exchange:Number($('.r-exchange',el).value),endurance:Number($('.r-endurance',el).value),pressure:Number($('.r-pressure',el).value)}))}
function renderRelay(){try{const event=$('#relayEvent').value+'m',athletes=readRelay(),r=optimizeRelay(event,athletes),sens=relaySensitivity(event,athletes);$('#relayResults').innerHTML=r.orders.slice(0,6).map(x=>`<div class="relay-card ${x.rank===1?'best':''}"><span class="rank">RANK ${x.rank}${x.rank===1?' · RECOMMENDED':''} · V1 BASELINE RANK ${x.legacyRank}</span><h3>${x.objective.toFixed(3)}</h3><div class="relay-order">${x.order.map((a,i)=>`<span>${i+1}. ${escapeHtml(a.name)} — ${escapeHtml(r.profiles[i].name)}</span>`).join('')}</div><p>Objective Δ ${x.delta.toFixed(3)} · role-fit ${x.fitScore.toFixed(3)} · reference sum ${x.referenceSum.toFixed(2)}s</p></div>`).join('');$('#relaySensitivity').innerHTML=`<b>Sensitivity:</b> the top order remains #1 in ${sens.stableScenarios}/${sens.total} global ±1 rating perturbations. ${r.nearTies.length>1?`${r.nearTies.length} orders are within the declared near-tie margin (Δ ≤ ${r.nearTieThreshold.toFixed(2)}).`:'No alternate order is inside the declared near-tie margin.'} ${escapeHtml(r.caution)}<br><small>${escapeHtml(r.method)} · objective: ${escapeHtml(r.objective)} · ${escapeHtml(r.legacyComparison)}</small>`}catch(e){toast(e.message)}}

function initIntelligence(){
  const ids=['cfSleep','cfStress','cfSoreness','cfIntensity'];ids.forEach(id=>{const input=$('#'+id),out=$('#'+id+'Out');const run=()=>{out.textContent=id==='cfSleep'?`${Number(input.value).toFixed(1)}h`:`${input.value}/10`;updateCounterfactual()};input.addEventListener('input',run);run()});
}
function updateCounterfactual(){if(!currentState)return;const base=readObservation(),r=counterfactual(readProfile(),base,getHistory(),{sleep:Number($('#cfSleep').value),stress:Number($('#cfStress').value),soreness:Number($('#cfSoreness').value)}),cfCompat=sessionCompatibility(r.scenario,{session:$('#plannedSession').value,intensity:Number($('#cfIntensity').value),duration:Number($('#sessionDuration').value),temp:Number($('#sessionTemp').value)});$('#counterfactualCompare').innerHTML=`<div class="scenario-box current"><small>CURRENT STATE</small><strong>${r.baseline.score}</strong><p>session ${currentCompatibility?.stateAware??'—'} · confidence ${r.baseline.confidence}%</p></div><div class="scenario-box"><small>EDITED SCENARIO</small><strong>${r.scenario.score}</strong><p>${r.delta>=0?'+':''}${r.delta} state points · session ${cfCompat.stateAware??'ABSTAIN'}</p></div><p class="fine-print">${escapeHtml(r.warning)}</p>`}

function initResearchNof1(){
  const p=store.get(KEY.protocol,null);if(p){$('#researchQuestion').value=p.question;$('#researchIV').value=p.iv;$('#researchMetric').value=p.metric;$('#researchDays').value=p.days;$('#researchSafety').value=p.safety;$('#researchPlan').value=p.plan;renderProtocol(p)}
  $('#researchForm').addEventListener('submit',e=>{e.preventDefault();const p={question:$('#researchQuestion').value.trim(),iv:$('#researchIV').value.trim(),metric:$('#researchMetric').value.trim(),days:Number($('#researchDays').value),safety:$('#researchSafety').value.trim(),plan:$('#researchPlan').value.trim(),savedAt:new Date().toISOString()};store.set(KEY.protocol,p);renderProtocol(p);toast('N-of-1 protocol saved locally')});
  $('#observationDate').value=isoDate();$('#observationForm').addEventListener('submit',e=>{e.preventDefault();const rows=store.get(KEY.observations,[]);rows.push({date:$('#observationDate').value,value:Number($('#observationValue').value),note:$('#observationNote').value.trim()});rows.sort((a,b)=>a.date.localeCompare(b.date));store.set(KEY.observations,rows.slice(-180));$('#observationValue').value='';$('#observationNote').value='';renderResearchChart();renderObservations()});
  $('#exportResearch').addEventListener('click',()=>downloadCsv('athena_nof1_observations.csv',store.get(KEY.observations,[])));renderResearchChart();renderObservations();
}
function renderProtocol(p){$('#protocolCard').classList.remove('empty-state');$('#protocolCard').innerHTML=`<b>${escapeHtml(p.question)}</b><p><strong>IV:</strong> ${escapeHtml(p.iv)} · <strong>Outcome:</strong> ${escapeHtml(p.metric)} · <strong>Duration:</strong> ${p.days} days</p><p><strong>Safety boundary:</strong> ${escapeHtml(p.safety)}</p><p>${escapeHtml(p.plan||'No additional protocol detail entered.')}</p>`}
function renderResearchChart(){const rows=store.get(KEY.observations,[]);drawLine($('#researchChart'),rows.map(x=>({label:x.date.slice(5),value:x.value})),{})}
function renderObservations(){const rows=store.get(KEY.observations,[]);$('#observationList').innerHTML=rows.slice(-12).reverse().map((x,i)=>`<div class="observation"><span>${escapeHtml(x.date)}</span><b>${x.value}</b><span>${escapeHtml(x.note||'')}</span><button class="text-btn obs-delete" data-date="${escapeHtml(x.date)}" data-value="${x.value}" aria-label="Delete observation">×</button></div>`).join('');$$('.obs-delete').forEach(btn=>btn.addEventListener('click',()=>{let a=store.get(KEY.observations,[]);a=a.filter(x=>!(x.date===btn.dataset.date&&String(x.value)===btn.dataset.value));store.set(KEY.observations,a);renderResearchChart();renderObservations()}))}

function initHealth(){
  ['heatTemp','heatHumidity','heatDuration','heatIntensity'].forEach(id=>$('#'+id).addEventListener('input',renderHeat));renderHeat();$('#heartAge').addEventListener('input',renderHeart);renderHeart();
  if(!store.get(KEY.sleep,null))store.set(KEY.sleep,[8,8,8,8,8,8,8]);renderSleep();$('#resetSleep').addEventListener('click',()=>{store.set(KEY.sleep,[8,8,8,8,8,8,8]);renderSleep()});
  $$('.concern').forEach(btn=>btn.addEventListener('click',()=>{$$('.concern').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderConcern(btn.dataset.concern)}));renderConcern('heat');
}
function renderHeat(){const r=heatContext($('#heatTemp').value,$('#heatHumidity').value,{duration:$('#heatDuration').value,intensity:$('#heatIntensity').value}),el=$('#heatResult');el.className=`health-result ${r.tone==='danger'?'danger':r.tone==='warn'||r.tone==='caution'?'warn':''}`;el.innerHTML=`<small>NWS HEAT INDEX ESTIMATE</small><h3>${r.heatIndex.toFixed(1)}°F · ${escapeHtml(r.band)}</h3><p>${escapeHtml(r.note)}</p>${r.modifiers.length?`<ul>${r.modifiers.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:''}`}
function renderHeart(){const r=heartRateGuide($('#heartAge').value);if(!r)return;$('#maxHr').textContent=`${r.max} bpm`;$('#moderateHr').textContent=`${r.moderate[0]}–${r.moderate[1]}`;$('#vigorousHr').textContent=`${r.vigorous[0]}–${r.vigorous[1]}`}
function renderSleep(){const vals=store.get(KEY.sleep,[8,8,8,8,8,8,8]);$('#sleepWeek').innerHTML=vals.map((v,i)=>`<label class="sleep-day"><small>${['M','T','W','T','F','S','S'][i]}</small><input type="number" min="0" max="16" step=".1" value="${v}" data-i="${i}" aria-label="Sleep hours day ${i+1}"></label>`).join('');$$('.sleep-day input').forEach(x=>x.addEventListener('input',()=>{const a=store.get(KEY.sleep,[8,8,8,8,8,8,8]);a[Number(x.dataset.i)]=Number(x.value);store.set(KEY.sleep,a);renderSleepSummary()}));renderSleepSummary()}
function renderSleepSummary(){const r=sleepSummary(store.get(KEY.sleep,[]),Number($('#athleteAge').value||16));$('#sleepSummary').innerHTML=`<small>7-NIGHT EDUCATIONAL SUMMARY</small><h3>${r.average.toFixed(1)} h average</h3><p>${r.inBand}/${r.n} nights in ${r.reference[0]}–${r.reference[1]} h reference band. ${escapeHtml(r.note)}</p>`}
function renderConcern(key){const r=concernInfo(key);$('#concernContent').innerHTML=`<h3>${escapeHtml(r.title)}</h3><ul>${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul><div class="urgent"><b>Urgent warning signs</b><p>${escapeHtml(r.urgent)}</p></div><p class="fine-print">ATHENA provides general educational guidance only. Local emergency plans and qualified adults/clinicians take priority.</p>`}

function initHandoff(){
  $('#symptomGrid').innerHTML=SYMPTOMS.map((s,i)=>`<label class="symptom-option"><input type="checkbox" value="${escapeHtml(s)}"> ${escapeHtml(s)}</label>`).join('');
  $('#handoffPain').addEventListener('input',()=>$('#painOut').textContent=`${$('#handoffPain').value} / 10`);$('#painOut').textContent=`${$('#handoffPain').value} / 10`;
  $('#handoffForm').addEventListener('input',updateHandoffCompleteness);$('#handoffForm').addEventListener('submit',e=>{e.preventDefault();renderHandoff(true)});$('#copyHandoff').addEventListener('click',async()=>{const r=renderHandoff(false);try{await navigator.clipboard.writeText(r.text);toast('SBAR copied')}catch{toast('Clipboard unavailable; select the note manually')}});$('#printHandoff').addEventListener('click',()=>window.print());updateHandoffCompleteness();renderHandoff(false);
}
function readHandoff(){return {name:$('#handoffName').value.trim(),event:$('#handoffEvent').value.trim(),situation:$('#handoffSituation').value.trim(),onset:$('#handoffOnset').value.trim(),background:$('#handoffBackground').value.trim(),status:$('#handoffStatus').value,pain:Number($('#handoffPain').value),actions:$('#handoffActions').value.trim(),request:$('#handoffRequest').value,symptoms:$$('#symptomGrid input:checked').map(x=>x.value)}}
function updateHandoffCompleteness(){const r=buildSBAR(readHandoff());$('#handoffCompleteness').textContent=`SBAR completeness: ${r.completeness}%${r.missing.length?` · missing: ${r.missing.join(', ')}`:' · core fields complete'}`}
function renderHandoff(showToast=false){const r=buildSBAR(readHandoff());$('#urgentBanner').classList.toggle('hidden',!r.urgent);$('#urgentBanner').textContent=r.urgent?'Potential urgent warning signal selected — get immediate adult/medical help as appropriate. ATHENA does not determine diagnosis.':'';const parts=r.text.split('\n\n');$('#handoffNote').innerHTML=parts.map(x=>`<h4>${escapeHtml(x.slice(0,1))}</h4><p>${escapeHtml(x.slice(4))}</p>`).join('')+`<p class="fine-print">${escapeHtml(r.caution)}</p>`;updateHandoffCompleteness();if(showToast)toast('Structured SBAR note built');return r}

function updateResearchDependent(){const d=getResearchData();if(!d)return;}

document.addEventListener('DOMContentLoaded',init);
