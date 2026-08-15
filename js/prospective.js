import { $, clamp, correlation, downloadJson, escapeHtml, isoDate, mean, round, store, toast } from './utils.js';

const KEY_PROTOCOL='athena_prospective_protocol_v2';
const KEY_RECORDS='athena_prospective_records_v2';
const KEY_ARCHIVE='athena_prospective_archive_v2';

function protocolHash(p){
  // Deterministic FNV-1a style fingerprint for a visible protocol lock. This is
  // an integrity/version identifier, not a cryptographic signature.
  const text=JSON.stringify({version:p.version,startDate:p.startDate,target:p.target,minimum:p.minimum,analysis:p.analysis,hypothesis:p.hypothesis,boundary:p.boundary,lockedAt:p.lockedAt});
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  return `PV-${h.toString(16).padStart(8,'0').toUpperCase()}`;
}

function linearFit(x,y){
  const mx=mean(x),my=mean(y); let num=0,den=0;
  for(let i=0;i<x.length;i++){num+=(x[i]-mx)*(y[i]-my);den+=(x[i]-mx)**2;}
  const slope=den?num/den:0; return {slope,intercept:my-slope*mx};
}

function analyze(protocol,records){
  const valid=records.filter(r=>Number.isFinite(Number(r.state))&&Number.isFinite(Number(r.quality))).sort((a,b)=>a.date.localeCompare(b.date));
  if(valid.length<protocol.minimum) return {ready:false,n:valid.length,need:protocol.minimum-valid.length};
  const cut=Math.max(12,Math.floor(valid.length*.60));
  const cal=valid.slice(0,cut),ev=valid.slice(cut);
  if(ev.length<8) return {ready:false,n:valid.length,need:Math.max(0,protocol.minimum-valid.length),reason:'At least 8 locked evaluation observations are required after the temporal split.'};
  const xCal=cal.map(r=>Number(r.state)),yCal=cal.map(r=>Number(r.quality));
  const xEv=ev.map(r=>Number(r.state)),yEv=ev.map(r=>Number(r.quality));
  const fit=linearFit(xCal,yCal),baseline=mean(yCal);
  const pred=xEv.map(x=>clamp(fit.intercept+fit.slope*x,0,10));
  const mae=a=>mean(a.map((v,i)=>Math.abs(v-yEv[i])));
  const baselinePred=yEv.map(()=>baseline);
  const modelMae=mae(pred),baseMae=mae(baselinePred);
  const corr=correlation(valid.map(r=>Number(r.state)),valid.map(r=>Number(r.quality)));
  return {
    ready:true,n:valid.length,nCalibration:cal.length,nEvaluation:ev.length,
    slope:round(fit.slope,4),intercept:round(fit.intercept,3),correlation:round(corr,3),
    modelMae:round(modelMae,3),baselineMae:round(baseMae,3),deltaMae:round(modelMae-baseMae,3),
    improved:modelMae<baseMae,
    interpretation:modelMae<baseMae?'The pre-registered state model improved MAE over the calibration-mean baseline on later observations.':'The pre-registered state model did not beat the simple baseline on later observations. This result should be reported as-is.'
  };
}

function setFormLocked(locked){
  ['prospectiveTarget','prospectiveMinimum','prospectiveStart','prospectiveAnalysis','prospectiveHypothesis','prospectiveBoundary','prospectiveAck'].forEach(id=>{const el=$('#'+id);if(el)el.disabled=locked});
  const btn=$('#lockProspective');if(btn)btn.disabled=locked;
}

function render(currentState){
  const p=store.get(KEY_PROTOCOL,null),records=store.get(KEY_RECORDS,[])||[];
  const pill=$('#prospectiveStatusPill');
  if(!p){
    setFormLocked(false); if(pill){pill.textContent='Not registered';pill.className='pill';}
    $('#prospectiveProtocolCard').className='protocol-card empty-state';
    $('#prospectiveProtocolCard').textContent='Register a protocol before collecting prospective validation records.';
    $('#prospectiveProgress').innerHTML='<div class="progress-stat"><small>STATUS</small><b>Protocol required</b><span>Future observations cannot be added before the analysis plan is locked.</span></div>';
    $('#prospectiveResult').textContent='No result yet. ATHENA will not analyze a prospective protocol before its locked minimum-data gate is satisfied.';
  } else {
    setFormLocked(true);if(pill){pill.textContent=`Locked · ${p.hash}`;pill.className='pill accent';}
    $('#prospectiveTarget').value=p.target;$('#prospectiveMinimum').value=p.minimum;$('#prospectiveStart').value=p.startDate;$('#prospectiveAnalysis').value=p.analysis;$('#prospectiveHypothesis').value=p.hypothesis;$('#prospectiveBoundary').value=p.boundary;
    $('#prospectiveProtocolCard').className='protocol-card';
    $('#prospectiveProtocolCard').innerHTML=`<p class="eyebrow">${escapeHtml(p.hash)} · VERSION ${p.version}</p><h4>Protocol locked ${escapeHtml(new Date(p.lockedAt).toLocaleString())}</h4><p><b>Target:</b> next-session quality (0–10) · <b>Minimum:</b> ${p.minimum} future observations · <b>Analysis:</b> first 60% calibration, last 40% evaluation.</p><p><b>Hypothesis:</b> ${escapeHtml(p.hypothesis)}</p><p class="fine-print">${escapeHtml(p.boundary)} Protocol fields are disabled after locking. Starting a new version archives, rather than silently overwrites, the prior protocol.</p>`;
    const a=analyze(p,records),pct=Math.min(100,records.length/p.minimum*100);
    $('#prospectiveProgress').innerHTML=`<div class="prospective-meter"><i style="width:${pct}%"></i></div><div class="progress-stat"><small>FUTURE RECORDS</small><b>${records.length} / ${p.minimum}</b><span>${a.ready?'Minimum-data gate satisfied. Locked temporal evaluation is available.':`${Math.max(0,p.minimum-records.length)} more future observations before analysis.`}</span></div><div class="prospective-records">${records.slice(-5).reverse().map(r=>`<div><b>${escapeHtml(r.date)}</b><span>state ${r.state} → quality ${r.quality}/10 · ${escapeHtml(r.session||'session')}</span></div>`).join('')||'<p class="empty-state">No future observations recorded yet.</p>'}</div>`;
    if(a.ready){
      $('#prospectiveResult').innerHTML=`<b>Pre-registered analysis unlocked</b><p>${a.nCalibration} calibration + ${a.nEvaluation} later evaluation observations. State/quality correlation across all locked records: <strong>${a.correlation}</strong>.</p><p>Evaluation MAE: <strong>${a.modelMae}</strong> quality points vs baseline <strong>${a.baselineMae}</strong> (${a.deltaMae<0?'improvement':'change'} ${Math.abs(a.deltaMae).toFixed(3)}).</p><p>${escapeHtml(a.interpretation)}</p><p class="fine-print">This is an observational self-tracking analysis, not proof of causality, safety, medical readiness, or injury prevention.</p>`;
    } else {
      $('#prospectiveResult').innerHTML=`<b>No prospective result claimed yet.</b><p>${a.reason?escapeHtml(a.reason):`The locked protocol requires ${p.minimum} future observations; ${records.length} exist.`}</p><p class="fine-print">The gate is intentional: ATHENA refuses to backfill or lower the minimum after seeing outcomes.</p>`;
    }
  }
  const stateInput=$('#prospectiveState');if(stateInput)stateInput.value=Number.isFinite(Number(currentState?.score))?currentState.score:'';
}

export function initProspective(getCurrentState){
  const start=$('#prospectiveStart'),date=$('#prospectiveDate');if(start&&!start.value)start.value=isoDate();if(date&&!date.value)date.value=isoDate();
  $('#prospectiveProtocolForm')?.addEventListener('submit',e=>{
    e.preventDefault(); if(store.get(KEY_PROTOCOL,null)){toast('Protocol is already locked. Start a new version to change it.');return;}
    const p={version:(store.get(KEY_ARCHIVE,[])||[]).length+1,startDate:$('#prospectiveStart').value,target:$('#prospectiveTarget').value,minimum:Number($('#prospectiveMinimum').value),analysis:$('#prospectiveAnalysis').value,hypothesis:$('#prospectiveHypothesis').value.trim(),boundary:$('#prospectiveBoundary').value.trim(),lockedAt:new Date().toISOString()};
    p.hash=protocolHash(p);store.set(KEY_PROTOCOL,p);store.set(KEY_RECORDS,[]);render(getCurrentState());toast(`Prospective protocol locked · ${p.hash}`);
  });
  $('#prospectiveObservationForm')?.addEventListener('submit',e=>{
    e.preventDefault();const p=store.get(KEY_PROTOCOL,null);if(!p){toast('Lock the prospective protocol first');return;}
    const date=$('#prospectiveDate').value;if(!date||date<p.startDate){toast('Prospective records must be on or after the locked start date');return;}
    const rows=store.get(KEY_RECORDS,[])||[];if(rows.some(r=>r.date===date)){toast('A prospective record already exists for that date');return;}
    const state=Number(getCurrentState()?.score);const quality=Number($('#prospectiveQuality').value);if(!Number.isFinite(state)||!Number.isFinite(quality)){toast('A current ATHENA state and session-quality value are required');return;}
    rows.push({date,recordedAt:new Date().toISOString(),state:round(state,0),quality:round(quality,1),session:$('#prospectiveSession').value.trim(),note:$('#prospectiveNote').value.trim(),protocolHash:p.hash});
    store.set(KEY_RECORDS,rows.sort((a,b)=>a.date.localeCompare(b.date)));$('#prospectiveQuality').value='';$('#prospectiveNote').value='';render(getCurrentState());toast('Future observation added to locked protocol');
  });
  $('#resetProspective')?.addEventListener('click',()=>{
    const p=store.get(KEY_PROTOCOL,null);if(!p){toast('No locked protocol to archive');return;}
    if(!confirm('Archive this prospective protocol and its observations, then start a new version? Existing records will remain in the local archive.'))return;
    const archive=store.get(KEY_ARCHIVE,[])||[];archive.push({protocol:p,records:store.get(KEY_RECORDS,[])||[],archivedAt:new Date().toISOString()});store.set(KEY_ARCHIVE,archive);store.remove(KEY_PROTOCOL);store.remove(KEY_RECORDS);render(getCurrentState());toast('Prior protocol archived; new version can be registered');
  });
  $('#exportProspective')?.addEventListener('click',()=>{const p=store.get(KEY_PROTOCOL,null),records=store.get(KEY_RECORDS,[])||[];downloadJson('athena_prospective_validation.json',{schema:'ATHENA_PROSPECTIVE_VALIDATION_v2',exportedAt:new Date().toISOString(),protocol:p,records,analysis:p?analyze(p,records):null,archive:store.get(KEY_ARCHIVE,[])||[]});});
  render(getCurrentState());
  return {render:()=>render(getCurrentState()),analyze};
}
