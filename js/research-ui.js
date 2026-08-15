import { $, escapeHtml, round, fmtSeconds, downloadJson, store, uid, isoDate } from './utils.js';
import { DATASET_REGISTRY, WELLNESS_EVIDENCE } from './data.js';

let researchData=null, wellnessData=null, integrityData=null, failureIndex=0, replayIndex=0;
const STORAGE_EXPERIMENTS='athena_experiments_v2';

function pct(v,d=2){ return Number.isFinite(Number(v)) ? `${Number(v).toFixed(d)}%` : '—'; }
function signed(v,d=3){ const n=Number(v); return Number.isFinite(n)?`${n>0?'+':''}${n.toFixed(d)}`:'—'; }
function metricCard(label,value,note=''){return `<div class="metric-card"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b><span>${escapeHtml(note)}</span></div>`}

export async function loadResearchData(){
  try{
    const [r,w,i]=await Promise.all([
      fetch('data/derived/research_results.json',{cache:'no-store'}),
      fetch('data/derived/wellness_results.json',{cache:'no-store'}),
      fetch('data/derived/evidence_integrity.json',{cache:'no-store'})
    ]);
    if(!r.ok) throw new Error(`Performance artifact HTTP ${r.status}`);
    if(!w.ok) throw new Error(`Wellness artifact HTTP ${w.status}`);
    if(!i.ok) throw new Error(`Evidence-integrity artifact HTTP ${i.status}`);
    researchData=await r.json(); wellnessData=await w.json(); integrityData=await i.json();
    renderResearch(researchData); renderWellnessValidation(wellnessData); renderEvidenceIntegrity(integrityData,researchData,wellnessData);
    return {performance:researchData,wellness:wellnessData,integrity:integrityData};
  }catch(err){
    const banner=$('#researchBanner');
    if(banner) banner.innerHTML=`<div><span class="status-dot warn"></span><b>Research result file could not load.</b></div><p>Serve ATHENA through a local/static web server (for example <code>python -m http.server</code>) rather than opening <code>index.html</code> as a file. Error: ${escapeHtml(err.message)}</p>`;
    return null;
  }
}

export function getResearchData(){return {performance:researchData,wellness:wellnessData,integrity:integrityData};}

function renderResearch(d){
  $('#researchQuestionText').textContent=d.primary_question;
  const ev=d.full_model.evaluation, base=d.full_model.personalized_baseline, roll=d.rolling_validation, unc=d.full_model.uncertainty, boot=d.full_model.cluster_bootstrap_vs_personalized||d.full_model.bootstrap_vs_personalized;
  $('#researchMetricCards').innerHTML=[
    metricCard('2025 ATHENA MAPE',pct(ev.mape_percent,3),`${ev.n.toLocaleString()} held-out predictions`),
    metricCard('Personal baseline',pct(base.mape_percent,3),'same evaluation set'),
    metricCard('Δ MAPE',`${signed(ev.mape_percent-base.mape_percent,3)} pts`,'lower is better'),
    metricCard('Rolling folds',`${roll.improved_folds}/${roll.total_folds} improved`,'2023 · 2024 · 2025'),
    metricCard('Dynamic coverage',pct(d.full_model.dynamic_coverage_percent,1),'outside = baseline abstention')
  ].join('');
  $('#claimBoundary').innerHTML=`<b>Claim boundary</b><p>${escapeHtml(d.claim_boundary)}</p><p><b>Development disclosure:</b> ${escapeHtml(d.protocol.development_disclosure)}</p>`;
  $('#metricSamples').textContent=Number(d.dataset.prediction_samples).toLocaleString();
  $('#metricAthletes').textContent=Number(d.dataset.athletes_used).toLocaleString();
  if($('#feasibilityRuntime')) $('#feasibilityRuntime').textContent=`CPU-only · ${Number(d.reproducibility.pipeline_runtime_seconds).toFixed(1)}s pipeline · ${Math.round(Number(d.reproducibility.peak_rss_kb)/1024)} MB peak`;
  $('#researchBanner').innerHTML=`<div><span class="status-dot"></span><b>REAL PUBLIC-DATA RESULT LOADED</b></div><p>${escapeHtml(d.dataset.name)} · ${escapeHtml(d.dataset.version)} · ${escapeHtml(d.dataset.license)} · generated ${new Date(d.generated_utc).toLocaleString()}</p>`;

  $('#modelHierarchy').innerHTML=`<div class="model-table"><div class="model-row header"><span>Model</span><span>MAPE</span><span>MAE</span><span>≤3%</span><span>Complexity</span></div>${d.model_hierarchy.map(m=>`<div class="model-row ${m.model.includes('M4')?'best':''}"><b>${escapeHtml(m.model)}</b><span>${pct(m.mape_percent,3)}</span><span>${Number(m.mae_seconds).toFixed(1)}s</span><span>${pct(m.within_3pct_percent,1)}</span><span>${m.fit_seconds?`${Number(m.fit_seconds).toFixed(1)}s · ${Number(m.serialized_kb||0).toFixed(0)}KB`:'analytic'}</span></div>`).join('')}</div>`;

  $('#foldBadge').textContent=`${roll.improved_folds}/${roll.total_folds} folds improved`;
  $('#rollingValidation').innerHTML=`<div class="fold-grid">${roll.folds.map(f=>`<div class="fold-card"><strong>${f.test_year}</strong><p>Calibrate ${f.calibration_year} · n=${Number(f.n_test).toLocaleString()} · dynamic coverage ${pct(f.dynamic_coverage_percent,1)}<br>Baseline ${pct(f.personalized_mape_percent,3)} → ATHENA ${pct(f.athena_mape_percent,3)}</p><span class="fold-delta">${signed(f.delta_mape_points,3)} pts</span></div>`).join('')}</div><p class="fine-print">Weighted change across folds: ${signed(roll.weighted_delta_mape_points,3)} MAPE points. These are retrospective rolling-origin folds, not prospective deployment results.</p>`;

  const rand=d.full_model.athlete_randomization_vs_personalized;
  $('#calibrationView').innerHTML=[
    `<div class="cal-item"><small>NOMINAL INTERVAL</small><b>${pct(unc.nominal_coverage_percent,0)}</b><span>split-conformal target</span></div>`,
    `<div class="cal-item"><small>EMPIRICAL COVERAGE</small><b>${pct(unc.empirical_coverage_percent,1)}</b><span>2025 evaluation</span></div>`,
    `<div class="cal-item"><small>MEDIAN WIDTH</small><b>${pct(unc.median_interval_width_percent_of_prediction,1)}</b><span>of prediction</span></div>`,
    `<div class="cal-item"><small>ATHLETE SIGN-FLIP</small><b>p=${Number(rand.one_sided_p).toExponential(1)}</b><span>${Number(rand.clusters).toLocaleString()} athlete clusters</span></div>`
  ].join('')+`<p class="fine-print">Athlete-cluster bootstrap ΔMAPE vs personalized baseline: ${signed(boot.mean_delta_mape_points,3)} points; 95% bootstrap interval [${(boot.cluster_ci95||boot.ci95).map(x=>Number(x).toFixed(3)).join(', ')}]. The sign-flip p-value is a paired retrospective diagnostic, not prospective or causal proof.</p>`;

  const maxA=Math.max(...d.ablations.map(a=>Math.abs(Number(a.delta_vs_full_mape_points))),.001);
  $('#ablationView').innerHTML=d.ablations.map(a=>`<div class="bar-row"><div><b>${escapeHtml(a.name)}</b><small>${pct(a.mape_percent,3)} MAPE · +${Number(a.delta_vs_full_mape_points).toFixed(3)} pts vs full</small></div><i style="--w:${Math.min(100,Math.abs(a.delta_vs_full_mape_points)/maxA*100)}%"></i></div>`).join('');

  const maxR=Math.max(...d.robustness.map(a=>Number(a.mape_percent)),1);
  $('#robustnessView').innerHTML=d.robustness.map(a=>`<div class="bar-row"><div><b>${escapeHtml(a.stress_test)}</b><small>${pct(a.mape_percent,3)} MAPE · n=${Number(a.n).toLocaleString()}</small></div><i style="--w:${Math.min(100,Number(a.mape_percent)/maxR*100)}%"></i></div>`).join('');

  renderExperimentMatrix(d);
  renderComplexityBenefit(d);
  renderFailureTaxonomy(d);
  renderDataQuality(d);

  const top=d.full_model.trust_region_calibration.filter(x=>x.selected);
  const featureImportance=d.full_model.feature_group_permutation_importance;
  $('#discoveryView').innerHTML=[
    `<div class="discovery-item"><b>Personalization is the dominant requirement.</b><p>Removing personalization increases 2025 MAPE from ${pct(ev.mape_percent,3)} to ${pct(d.ablations[0].mape_percent,3)}. The athlete-specific baseline is therefore a core mechanism, not a cosmetic input.</p></div>`,
    `<div class="discovery-item"><b>Dynamic correction earns its place only locally.</b><p>The calibration-derived ATHENA Evidence Gate selected ${top.map(x=>escapeHtml(x.event_name)).join(', ')} for 2025 and activated on ${pct(d.full_model.dynamic_coverage_percent,1)} of evaluation cases. Within that pre-calibrated active region, MAPE changed from ${pct(d.full_model.active_trust_region?.personalized_baseline?.mape_percent,3)} to ${pct(d.full_model.active_trust_region?.athena_dynamic?.mape_percent,3)}, and ${pct(d.full_model.active_trust_region?.athletes_improved_percent,1)} of represented athletes improved on mean APE. Elsewhere ATHENA intentionally falls back.</p></div>`,
    `<div class="discovery-item"><b>Rolling-origin improvement is modest but consistent.</b><p>ATHENA improved MAPE in ${roll.improved_folds}/${roll.total_folds} consecutive retrospective folds, with relative fold changes from ${Math.min(...roll.folds.map(f=>f.relative_mape_change_percent)).toFixed(2)}% to ${Math.max(...roll.folds.map(f=>f.relative_mape_change_percent)).toFixed(2)}%.</p></div>`,
    `<div class="discovery-item"><b>Every grouped feature family contributed in the corrected calibration diagnostic.</b><p>${featureImportance.map(x=>`${escapeHtml(x.group)}: ${signed(x.mape_increase_points,4)} pts`).join(' · ')}. These are calibration-set permutation diagnostics, not causal effects or universal feature rankings.</p></div>`,
    `<div class="discovery-item"><b>Distribution shift triggers abstention.</b><p>${escapeHtml(d.forward_shift_audit.interpretation)} Dynamic coverage falls to ${pct(d.forward_shift_audit.dynamic_coverage_percent,2)} in the partial 2026 audit.</p></div>`
  ].join('');

  failureIndex=0; replayIndex=0; renderFailure(); renderReplay();
  const fi=d.failure_iteration;
  $('#failureIteration').innerHTML=[['OBSERVE',fi.v0_observation],['DIAGNOSE',fi.diagnosis],['CHANGE',fi.change],['LEARN',fi.lesson]].map(([a,b])=>`<div class="iteration-step"><small>${a}</small><p>${escapeHtml(b)}</p></div>`).join('');
  renderDatasetRegistry(); renderWellnessEvidence(); renderRepro(d); renderFeasibility(d); renderResearchGraph(); renderExperimentHistory();
}


function renderExperimentMatrix(d){
  const rows=d.experiment_matrix||[];
  const groups=[...new Set(rows.map(x=>x.family))];
  $('#experimentMatrix').innerHTML=groups.map(g=>{
    const subset=rows.filter(x=>x.family===g);
    return `<div class="matrix-family"><small>${escapeHtml(g.toUpperCase())}</small><b>${subset.length} registered checks</b><span>${escapeHtml(subset.map(x=>x.name).slice(0,4).join(' · '))}${subset.length>4?' · …':''}</span></div>`;
  }).join('')||'<p class="empty-state">No experiment matrix loaded.</p>';
}

function renderComplexityBenefit(d){
  const rows=d.complexity_benefit||[];
  $('#complexityBenefit').innerHTML=`<div class="model-row header"><span>Model</span><span>MAPE</span><span>Size</span><span>Fit</span><span>Frontier</span></div>${rows.map(x=>`<div class="model-row ${x.model.includes('M4')?'best':''}"><b>${escapeHtml(x.model)}</b><span>${pct(x.mape_percent,3)}</span><span>${Number(x.serialized_kb).toFixed(x.serialized_kb<10?1:0)} KB</span><span>${Number(x.fit_seconds).toFixed(2)}s</span><span>${x.pareto_efficient?'✓ Pareto':'dominated'}</span></div>`).join('')}<p class="fine-print">Pareto-efficient means no listed model is both no worse in MAPE and no larger in serialized size with at least one strict advantage. M1 remains a formidable zero-model-size baseline.</p>`;
}

function renderFailureTaxonomy(d){
  const rows=d.failure_categories||[];
  $('#failureTaxonomy').innerHTML=rows.map(x=>`<div class="taxonomy-row"><div><b>${escapeHtml(x.category)}</b><span>${Number(x.n).toLocaleString()} records</span></div><strong>${pct(x.percent_of_evaluation,2)}</strong></div>`).join('')+`<p class="fine-print">Categories overlap by design. No category is removed from the headline evaluation.</p>`;
}

function renderDataQuality(d){
  const q=d.data_quality||{}; const miss=(q.modeling_field_missingness||[]).slice().sort((a,b)=>b.missing_percent-a.missing_percent);
  const top=miss.slice(0,7);
  $('#dataQualityView').innerHTML=`<div class="quality-stats"><div><small>MODELING FIELDS</small><b>${miss.length}</b></div><div><small>CLEANING RULES</small><b>${(q.cleaning_log||[]).length}</b></div></div><div class="quality-list">${top.map(x=>`<div><span>${escapeHtml(x.field)}</span><b>${pct(x.missing_percent,1)} missing</b></div>`).join('')}</div><details><summary>Cleaning log</summary><ol>${(q.cleaning_log||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></details><p class="fine-print">Missing environment metadata is retained as missing and stress-tested; ATHENA does not backfill imaginary measurements.</p>`;
}

function renderFailure(){
  if(!researchData)return; const rows=researchData.largest_error_cases||[]; if(!rows.length)return;
  failureIndex=((failureIndex%rows.length)+rows.length)%rows.length; const x=rows[failureIndex];
  $('#failureView').innerHTML=`<div class="failure-metrics"><div><small>EVENT</small><b>${escapeHtml(x.event_name)}</b></div><div><small>HISTORY</small><b>${x.prior_count} prior</b></div><div><small>APE</small><b>${pct(x.ape_percent,1)}</b></div><div><small>INTERVAL HIT?</small><b>${x.covered?'YES':'NO'}</b></div></div><p>On ${escapeHtml(x.date)}, the archived outcome was ${fmtSeconds(x.target_seconds)} while ATHENA predicted ${fmtSeconds(x.pred_seconds)}. The previous result was ${fmtSeconds(x.last_time)}, with ${Math.round(x.days_since)} days since prior history.</p><p><b>Failure hypothesis:</b> long gaps, sparse history, event changes, measurement/course context, or genuine performance discontinuity can break continuity assumptions. ATHENA surfaces these cases instead of removing them.</p>`;
}
function renderReplay(){
  if(!researchData)return; const rows=researchData.heldout_examples||[]; if(!rows.length)return;
  replayIndex=((replayIndex%rows.length)+rows.length)%rows.length; const x=rows[replayIndex];
  $('#replayView').innerHTML=`<p class="eyebrow">HELD-OUT ${escapeHtml(x.date)} · ${escapeHtml(x.event_name)}</p><div class="failure-metrics"><div><small>PRIOR RESULTS</small><b>${x.prior_count}</b></div><div><small>PREDICTION</small><b>${fmtSeconds(x.prediction)}</b></div><div><small>ARCHIVED OUTCOME</small><b>${fmtSeconds(x.target_seconds)}</b></div><div><small>ERROR</small><b>${pct(x.ape,2)}</b></div></div><p>Prediction interval: ${fmtSeconds(x.interval_low)}–${fmtSeconds(x.interval_high)}. Dynamic correction ${x.dynamic_used?'activated':'abstained to personalized baseline'}.</p><p class="fine-print">Retrospective replay uses anonymized public records. It does not imply ATHENA was available before the event or would have changed the outcome.</p>`;
}

function renderWellnessValidation(w){
  const q=$('#wellnessQuestionText'); if(!q||!w)return;
  q.textContent=w.question;
  const ath=w.athena.evaluation, pers=w.model_hierarchy.find(x=>x.model.includes('Persistence')), boot=w.athena.cluster_bootstrap_vs_persistence, ext=w.external_user_replication;
  $('#wellnessMetricCards').innerHTML=[
    metricCard('ATHENA wellness MAE',Number(ath.mae_readiness_points).toFixed(3),'0–10 next-day readiness'),
    metricCard('Persistence MAE',Number(pers.mae_readiness_points).toFixed(3),'tomorrow = today baseline'),
    metricCard('Relative change',`${Number(w.athena.vs_persistence_relative_mae_change_percent).toFixed(2)}%`,'lower is better'),
    metricCard('Unseen-person test',`${ext.participants_dynamic_better_than_persistence}/${ext.participants_total}`,'participants better than persistence')
  ].join('');
  const exact=w.athena.participant_exact_randomization_vs_persistence;
  const splitText=(w.split_sensitivity||[]).map(x=>`${escapeHtml(x.split)}: ${Number(x.relative_mae_change_percent).toFixed(2)}%`).join(' · ');
  const neg=w.negative_control;
  $('#wellnessValidation').innerHTML=`<b>Independent ATHENA reanalysis</b><p>${escapeHtml(w.dataset.name)} · ${w.dataset.participants} participants · ${Number(w.dataset.prediction_samples).toLocaleString()} leakage-safe next-day samples. Main evaluation: ${w.protocol.n_evaluation} later observations after participant-wise chronological train/calibration splits.</p><p><b>Cluster bootstrap:</b> ΔMAE ${signed(boot.mean_delta_mae_points,3)} points; 95% interval [${Number(boot.ci95_low).toFixed(3)}, ${Number(boot.ci95_high).toFixed(3)}]. <b>Exact participant sign-flip:</b> two-sided p=${Number(exact.two_sided_exact_p).toFixed(3)}. This is promising replication, not definitive superiority.</p><p><b>Split sensitivity:</b> ${splitText}. <b>Scrambled-target control:</b> λ=${Number(neg.calibration_blend_lambda).toFixed(1)} and ${Number(neg.evaluation.mae_readiness_points).toFixed(3)} MAE versus ${Number(neg.persistence.mae_readiness_points).toFixed(3)} persistence—no material artificial gain.</p><p class="fine-print">${escapeHtml(w.claim_boundary)}</p>`;
  $('#wellnessModelHierarchy').innerHTML=`<div class="model-row header"><span>Model</span><span>MAE</span><span>RMSE</span><span>≤1 pt</span></div>${w.model_hierarchy.map(m=>`<div class="model-row ${m.model.includes('W4')?'best':''}"><b>${escapeHtml(m.model)}</b><span>${Number(m.mae_readiness_points).toFixed(3)}</span><span>${Number(m.rmse_readiness_points).toFixed(3)}</span><span>${pct(m.within_1_point_percent,1)}</span></div>`).join('')}`;
  const pm=ext.participant_mean_mae;
  $('#wellnessExternal').innerHTML=`<div class="wellness-external-grid"><div><small>LOPO ATHENA MAE</small><b>${Number(pm.athena_dynamic).toFixed(3)}</b></div><div><small>LOPO PERSISTENCE</small><b>${Number(pm.persistence).toFixed(3)}</b></div><div><small>LOPO STATIC</small><b>${Number(pm.static).toFixed(3)}</b></div></div><p class="wellness-validation-note">Leave-one-participant-out means each person was predicted by a model trained without that person. ATHENA dynamic beat persistence for ${ext.participants_dynamic_better_than_persistence}/${ext.participants_total} participants and the static wellness model for ${ext.participants_dynamic_better_than_static}/${ext.participants_total}. The smaller cohort remains a stated limitation.</p>`;
  renderWellnessEvidence();
}

function renderEvidenceIntegrity(i,r,w){
  const el=$('#integrityView'); if(!el||!i)return;
  const rand=r.full_model.athlete_randomization_vs_personalized;
  const exact=w.athena.participant_exact_randomization_vs_persistence;
  const sub=(r.subgroup_audit||[]);
  const worst=[...sub].filter(x=>Number.isFinite(Number(x.interval_coverage_percent))).sort((a,b)=>Number(a.interval_coverage_percent)-Number(b.interval_coverage_percent)).slice(0,3);
  const history=sub.filter(x=>x.family==='history depth').sort((a,b)=>Number(a.n)-Number(b.n));
  $('#integrityMetricCards').innerHTML=[
    metricCard('Automated integrity',`${i.checks_passed}/${i.checks_total}`,`${i.release_status} · no release-blocking failures`),
    metricCard('Performance sign-flip',`p=${Number(rand.one_sided_p).toExponential(1)}`,'equal athlete weighting'),
    metricCard('Wellness exact test',`p=${Number(exact.two_sided_exact_p).toFixed(3)}`,'16-participant exact sign flip'),
    metricCard('Alt wellness splits',`${(w.split_sensitivity||[]).filter(x=>Number(x.relative_mae_change_percent)<0).length}/${(w.split_sensitivity||[]).length} improve`,'direction stability')
  ].join('');
  el.innerHTML=`<div class="integrity-checks">${i.checks.map(x=>`<div class="integrity-row ${x.pass?'pass':'warn'}"><span>${x.pass?'✓':'!'}</span><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.detail)}</small></div></div>`).join('')}</div><div class="boundary-box"><b>Subgroup calibration audit</b><p>${worst.map(x=>`${escapeHtml(x.family)} / ${escapeHtml(x.group)}: ${pct(x.interval_coverage_percent,1)} interval coverage, ${signed(x.delta_mape_points,3)} ΔMAPE`).join(' · ')}</p><p class="fine-print">The audit is descriptive and intentionally surfaces under-covered groups instead of hiding them. ${history.length?`Across history-depth bands, ATHENA’s change versus the personalized baseline ranges from ${signed(Math.max(...history.map(x=>x.delta_mape_points)),3)} to ${signed(Math.min(...history.map(x=>x.delta_mape_points)),3)} MAPE points.`:''}</p></div><details class="technical-details"><summary>Verified claim ledger</summary>${i.claim_ledger.map(x=>`<div class="claim-ledger-row"><b>${escapeHtml(x.claim)}</b><span>${escapeHtml(x.value)}</span><small>${escapeHtml(x.boundary)} · ${escapeHtml(x.source)}</small></div>`).join('')}</details>`;
}

function renderWellnessEvidence(){
  const el=$('#wellnessEvidence');if(!el)return;
  el.innerHTML=WELLNESS_EVIDENCE.map((x,i)=>`<div class="evidence-card"><div class="evidence-card-head"><span>${String(i+1).padStart(2,'0')}</span><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.role)}</small></div></div><p>${escapeHtml(x.detail)}</p><div class="signal-chips">${x.signals.map(s=>`<span>${escapeHtml(s)}</span>`).join('')}</div><p class="fine-print"><b>Boundary:</b> ${escapeHtml(x.status)}</p><a href="${escapeHtml(x.source)}" target="_blank" rel="noopener noreferrer">Public source ↗</a></div>`).join('')+`<div class="boundary-box evidence-boundary"><b>What changed in ATHENA</b><p>The daily-state engine now treats these variables as an evidence-informed, personalized observation layer: absolute reference normalization remains dominant for safety/interpretability, while recent personal-history deviations gradually contribute context. PMData is now independently reanalyzed for next-day readiness prediction; SoccerMon and REST remain external evidence domains. ATHENA still does not claim causal effects, medical readiness, or injury-prevention validation.</p></div>`;
}

function renderDatasetRegistry(){
  $('#datasetRegistry').innerHTML=DATASET_REGISTRY.map(x=>`<div class="dataset-row"><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.version)} · ${escapeHtml(x.status)}</small></div><p><strong>Supports:</strong> ${escapeHtml(x.supports)}<br><strong>Does not support:</strong> ${escapeHtml(x.doesNot)}</p><a href="${escapeHtml(x.source)}" target="_blank" rel="noopener noreferrer">Source ↗</a></div>`).join('');
}
function renderRepro(d){
  const r=d.reproducibility;
  $('#reproManifest').innerHTML=`<dl><dt>Experiment</dt><dd>${escapeHtml(r.experiment_id)}</dd><dt>Script</dt><dd><code>${escapeHtml(r.script)}</code></dd><dt>Seed</dt><dd>${r.random_seed}</dd><dt>Dataset SHA-256</dt><dd><code>${escapeHtml(d.dataset.sha256)}</code></dd><dt>Environment</dt><dd>Python ${escapeHtml(r.python)} · pandas ${escapeHtml(r.pandas)} · NumPy ${escapeHtml(r.numpy)} · scikit-learn ${escapeHtml(r.sklearn)}</dd><dt>Measured run</dt><dd>${Number(r.pipeline_runtime_seconds).toFixed(1)}s · ${Math.round(Number(r.peak_rss_kb)/1024)} MB peak RSS in the build environment</dd><dt>Protocol</dt><dd>${escapeHtml(d.protocol.strategy)}</dd></dl>`;
}
function renderFeasibility(d){
  const items=[
    ['1 · Frame','Lock one measurable target: next running performance; preserve broader ATHENA tools as supporting product modules.'],
    ['2 · Reproduce',`Run ${d.reproducibility.script} locally on the bundled/open NRCD data; no paid GPU or API is required.`],
    ['3 · Validate','Use rolling-origin years, calibration-only trust-region selection, held-out evaluation, uncertainty and robustness checks.'],
    ['4 · Validate wellness','Reanalyze PMData as a separate next-day readiness experiment with temporal splits and leave-one-participant-out stress testing; keep SoccerMon/REST as supporting domains.'],
    ['5 · Prospective mode','Lock a future-data protocol in-app, collect chronological observations locally, and refuse to report results before the minimum-data gate.'],
    ['6 · Report','Freeze versions, regenerate figures/results, document failures/limits, and package the reproducible artifact within a semester.']
  ];
  $('#feasibilityTimeline').innerHTML=items.map(([a,b])=>`<div class="timeline-step"><b>${a}</b><span>${escapeHtml(b)}</span></div>`).join('');
}
function renderResearchGraph(exp=null){
  const e=exp||store.get(STORAGE_EXPERIMENTS,[]).at(-1)||{question:researchData?.primary_question,dataset:'NRCD v2.0.0',method:'Rolling-origin + calibrated trust-region abstention',result:researchData?`2025 MAPE ${researchData.full_model.evaluation.mape_percent.toFixed(3)}%; ${researchData.rolling_validation.improved_folds}/${researchData.rolling_validation.total_folds} folds improved`:'Load result',conclusion:'Dynamic correction is useful only in supported regions; personalization remains the default baseline.'};
  const nodes=[['QUESTION',e.question],['DATA',e.dataset],['METHOD',e.method||e.evaluation],['RESULT',e.result||'Pending / registered'],['CONCLUSION',e.conclusion||'Do not conclude until evaluated']];
  $('#researchGraph').innerHTML=nodes.map(([k,v])=>`<div class="graph-node"><small>${k}</small><b>${escapeHtml(String(v||''))}</b></div>`).join('');
}
function renderExperimentHistory(){
  const rows=store.get(STORAGE_EXPERIMENTS,[]);
  $('#experimentHistory').innerHTML=rows.length?rows.slice(-6).reverse().map(x=>`<div class="history-row"><b>${escapeHtml(x.id)}</b> · ${escapeHtml(x.date)} · ${escapeHtml(x.question)} ${x.result?`<br><span>${escapeHtml(x.result)}</span>`:''}</div>`).join(''):'<p class="empty-state">No local experiment manifests registered yet.</p>';
}

export function bindResearchUI(){
  $('#cycleFailure')?.addEventListener('click',()=>{failureIndex++;renderFailure()});
  $('#nextReplay')?.addEventListener('click',()=>{replayIndex++;renderReplay()});
  $('#downloadResearchJson')?.addEventListener('click',()=>researchData&&downloadJson('athena_research_results.json',researchData));
  $('#runPublicExperiment')?.addEventListener('click',()=>{
    if(!researchData)return;
    const rows=store.get(STORAGE_EXPERIMENTS,[]); const item={id:uid('EXP'),date:isoDate(),question:researchData.primary_question,dataset:`${researchData.dataset.name} ${researchData.dataset.version}`,method:researchData.protocol.strategy,evaluation:'Precomputed reproducible pipeline result',result:`2025 MAPE ${researchData.full_model.evaluation.mape_percent.toFixed(3)}%; baseline ${researchData.full_model.personalized_baseline.mape_percent.toFixed(3)}%; rolling ${researchData.rolling_validation.improved_folds}/${researchData.rolling_validation.total_folds}`,conclusion:'Preliminary retrospective evidence supports gated dynamic correction in calibrated trust regions; no clinical/wellness validation is claimed.'};
    rows.push(item);store.set(STORAGE_EXPERIMENTS,rows.slice(-30));renderResearchGraph(item);renderExperimentHistory();
  });
  $('#experimentForm')?.addEventListener('submit',e=>{
    e.preventDefault(); const rows=store.get(STORAGE_EXPERIMENTS,[]); const item={id:uid('EXP'),date:isoDate(),question:$('#experimentQuestion').value.trim(),hypothesis:$('#experimentHypothesis').value.trim(),dataset:$('#experimentDataset').value,target:$('#experimentTarget').value.trim(),features:$('#experimentFeatures').value,evaluation:$('#experimentEvaluation').value,method:$('#experimentEvaluation').value,result:'Registered; no result claimed',conclusion:'Pending evaluation'};rows.push(item);store.set(STORAGE_EXPERIMENTS,rows.slice(-30));renderResearchGraph(item);renderExperimentHistory();
  });
  $('#exportExperiment')?.addEventListener('click',()=>downloadJson('athena_experiment_manifests.json',{schema:'ATHENA_EXPERIMENT_MANIFEST_v2',experiments:store.get(STORAGE_EXPERIMENTS,[])}));
}
