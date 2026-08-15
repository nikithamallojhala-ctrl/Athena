import { clamp, mean, std, round } from './utils.js';
import { EVENT_DATA, SESSION_DEMANDS } from './data.js';

export const STATE_VERSION = 'ATHENA_STATE_v2.2.0';
export const STATE_SCHEMA_VERSION = 2;

const DIMENSIONS = ['recovery','freshness','loadTolerance','powerAvailability','aerobicDurability','stability'];
const DISPLAY = {
  recovery:'Recovery', freshness:'Freshness', loadTolerance:'Load tolerance',
  powerAvailability:'Power availability', aerobicDurability:'Aerobic durability', stability:'Stability'
};

function scoreSleep(hours, age=16){
  const h=Number(hours);
  if(!Number.isFinite(h)) return 70;
  // For teenagers, 8–10 h is the reference band used only as an educational normalization.
  // This is not a clinical sleep assessment and adults are handled with a wider neutral plateau.
  const low = age >= 13 && age <= 18 ? 8 : 7;
  const high = age >= 13 && age <= 18 ? 10 : 9;
  if(h >= low && h <= high) return 100;
  if(h < low) return clamp(100 - (low-h)*18, 20, 100);
  return clamp(100 - (h-high)*10, 45, 100);
}

function hrScore(resting, baseline){
  const r=Number(resting), b=Number(baseline);
  if(!Number.isFinite(r)||!Number.isFinite(b)||b<=0) return {score:70,deviation:null};
  const delta=(r-b)/b;
  // Neutral near baseline. Larger upward deviations lower the observation score; modest decreases are not rewarded aggressively.
  let score=100;
  if(delta>0.02) score=100-(delta-.02)*260;
  else if(delta<-.12) score=88-Math.abs(delta+.12)*90;
  return {score:clamp(score,30,100),deviation:delta};
}

function demand(event){
  return EVENT_DATA[event]?.demands || EVENT_DATA['100m'].demands;
}

function absoluteObservation(obs, profile={}){
  const h=hrScore(obs.restingHr, profile.baselineHr);
  const finite=(v,fallback=70)=>Number.isFinite(Number(v))?Number(v):fallback;
  return {
    sleep: scoreSleep(obs.sleep, profile.age),
    energy: clamp(finite(obs.energy,7)*10),
    soreness: clamp(100-finite(obs.soreness,3)*10),
    stress: clamp(100-finite(obs.stress,3)*10),
    hydration: clamp(finite(obs.hydration,.70)*100),
    heart: h.score,
    loadRecovery: clamp(100-finite(obs.load,4)*7.5,25,100),
    hrDeviation:h.deviation
  };
}

function evidenceInformedObservation(obs, profile={}, history=[]){
  const absolute=absoluteObservation(obs,profile);
  // Public athlete-monitoring datasets such as SoccerMon/PMData support these as
  // meaningful longitudinal observation variables, but they do not provide
  // ATHENA-specific causal weights. We therefore use personal history only as a
  // conservative context adjustment; absolute normalization remains dominant.
  const specs={
    sleep:{direction:1,absoluteKey:'sleep'}, energy:{direction:1,absoluteKey:'energy'},
    soreness:{direction:-1,absoluteKey:'soreness'}, stress:{direction:-1,absoluteKey:'stress'},
    hydration:{direction:1,absoluteKey:'hydration'}, restingHr:{direction:-1,absoluteKey:'heart'},
    load:{direction:-1,absoluteKey:'loadRecovery'}
  };
  const adjusted={...absolute},personal={};
  for(const [rawKey,spec] of Object.entries(specs)){
    const vals=history.map(h=>Number(h.observation?.[rawKey])).filter(Number.isFinite).slice(-14);
    const current=Number(obs[rawKey]);
    if(vals.length<5||!Number.isFinite(current)){personal[rawKey]={n:vals.length,active:false};continue;}
    const m=mean(vals),sd=std(vals);if(sd<=1e-9){personal[rawKey]={n:vals.length,active:false,mean:round(m,3),sd:0};continue;}
    const z=clamp((current-m)/sd,-3,3);
    // 50 is neutral personal pattern. Direction only describes deviation from
    // recent self-history; it cannot override an unsafe or poor absolute score.
    const relative=clamp(50+spec.direction*z*12,20,80);
    const blend=clamp((vals.length-4)/36,0,.25);
    const abs=absolute[spec.absoluteKey];
    adjusted[spec.absoluteKey]=round((1-blend)*abs+blend*relative,2);
    personal[rawKey]={n:vals.length,active:true,mean:round(m,3),sd:round(sd,3),z:round(z,2),relativeScore:round(relative,1),blend:round(blend,3)};
  }
  adjusted.personalization=personal;
  adjusted.personalizationBoundary='Personal-history adjustment is capped at 25%; reference/safety normalization remains dominant. External public datasets support variable relevance, not ATHENA-specific causal weights.';
  return adjusted;
}

function contextObservation(norm, event){
  const d=demand(event);
  // Event-aware projection: the same observations contribute differently to dimensions,
  // but the transformation remains fully inspectable rather than pretending to be clinically learned.
  const recovery = .23*norm.sleep + .19*norm.energy + .17*norm.soreness + .14*norm.stress + .11*norm.hydration + .11*norm.heart + .05*norm.loadRecovery;
  const freshness = .25*norm.energy + .22*norm.soreness + .17*norm.sleep + .14*norm.stress + .12*norm.heart + .10*norm.loadRecovery;
  const loadTolerance = .23*norm.soreness + .21*norm.sleep + .18*norm.energy + .16*norm.stress + .12*norm.hydration + .10*norm.heart;
  const powerAvailability = (.34+.10*d.power)*norm.energy + (.20+.08*d.speed)*norm.soreness + .16*norm.sleep + .12*norm.stress + .10*norm.heart;
  const aerobicDurability = (.23+.10*d.aerobic)*norm.energy + .22*norm.sleep + .18*norm.hydration + .14*norm.stress + .13*norm.heart;
  const stability = .24*norm.stress + .20*norm.soreness + .18*norm.heart + .16*norm.sleep + .12*norm.hydration + .10*norm.energy;
  return Object.fromEntries(Object.entries({recovery,freshness,loadTolerance,powerAvailability,aerobicDurability,stability}).map(([k,v])=>[k,clamp(v)]));
}

function historySignal(history=[]){
  if(!history.length) return null;
  const recent=history.slice(-7);
  const result={};
  for(const dim of DIMENSIONS){
    const vals=recent.map(h=>Number(h.dimensions?.[dim])).filter(Number.isFinite);
    if(vals.length) result[dim]=mean(vals);
  }
  return result;
}


function personalBaselineContext(history=[], obs={}){
  const fields={sleep:'Sleep',energy:'Energy',soreness:'Soreness',stress:'Stress',hydration:'Hydration',restingHr:'Resting pulse',load:'Prior effort'};
  const out={}; const deviations=[];
  for(const [key,label] of Object.entries(fields)){
    const values=history.map(h=>Number(h.observation?.[key])).filter(Number.isFinite).slice(-14);
    const current=Number(obs[key]);
    if(values.length<3 || !Number.isFinite(current)){ out[key]={label,n:values.length,available:false}; continue; }
    const m=mean(values), sd=std(values), z=sd>1e-9?(current-m)/sd:0;
    out[key]={label,n:values.length,available:true,mean:round(m,3),sd:round(sd,3),current:round(current,3),z:round(z,2)};
    if(values.length>=5 && Math.abs(z)>=2) deviations.push({key,label,z:round(z,2),direction:z>0?'above':'below',message:`${label} is ${Math.abs(round(z,1))} SD ${z>0?'above':'below'} the recent personal pattern.`});
  }
  return {window:14,fields:out,deviations,nHistory:history.length,note:'Personal-pattern deviations are descriptive context only; ATHENA does not redefine healthy/safe values around an individual baseline.'};
}

function signalAgreement(norm){
  const vals=[norm.sleep,norm.energy,norm.soreness,norm.stress,norm.hydration,norm.heart];
  const s=std(vals);
  return clamp(100-s*1.35,15,100);
}

export function safetyAssessment(flag='none'){
  const f=String(flag||'none');
  if(f==='none') return {override:false,severity:'none',title:'No safety override',message:''};
  const messages={
    pain:'New or worsening pain should be assessed before using a readiness score to justify harder training.',
    illness:'Feeling ill or feverish is outside ATHENA’s performance-model scope; prioritize recovery and appropriate adult/clinical guidance.',
    breathing:'A breathing concern overrides performance recommendations. Stop activity and tell a trusted adult; seek urgent help for severe or worsening symptoms.',
    head:'A head-impact/concussion concern overrides performance recommendations. Leave activity and tell a trusted adult; return-to-sport decisions belong with healthcare professionals.',
    chest:'Chest pain, fainting, or near-fainting overrides performance recommendations and can require urgent medical assessment.'
  };
  return {override:true,severity:['breathing','head','chest'].includes(f)?'urgent':'caution',title:'Safety override active',message:messages[f]||'A safety concern overrides performance modeling.'};
}

export function computeState(profile, obs, history=[]){
  const event=profile.primaryEvent || '100m';
  const norm=evidenceInformedObservation(obs, profile, history);
  const current=contextObservation(norm,event);
  const prev=historySignal(history);
  const depth=Math.min(history.length,14);
  // History depth gradually raises smoothing; new athletes remain mostly observation-driven.
  const lambda=prev ? clamp(.18 + depth*.025,.18,.48) : 0;
  const dimensions={};
  for(const dim of DIMENSIONS){
    const p=prev?.[dim];
    dimensions[dim]=round(Number.isFinite(p) ? lambda*p + (1-lambda)*current[dim] : current[dim],1);
  }
  const d=demand(event);
  const powerWeight=(d.speed+d.power+d.technical)/3;
  const aerobicWeight=d.aerobic;
  const totalWeight=1 + .115*powerWeight + .115*aerobicWeight;
  const overall=(
    dimensions.recovery*.24 + dimensions.freshness*.20 + dimensions.loadTolerance*.18 +
    dimensions.stability*.15 + dimensions.powerAvailability*(.115+.115*powerWeight) +
    dimensions.aerobicDurability*(.115+.115*aerobicWeight)
  )/totalWeight;
  const safety=safetyAssessment(obs.healthFlag);
  const personalBaseline=personalBaselineContext(history,obs);
  const completeness=['sleep','energy','soreness','stress','hydration','restingHr','load'].filter(k=>obs[k]!==''&&obs[k]!=null&&Number.isFinite(Number(obs[k]))).length/7;
  const confidence=round(clamp(24 + Math.min(history.length,10)*4.4 + completeness*19 + signalAgreement(norm)*.15,28,94),0);
  let score=round(clamp(overall),0);
  const provisional=history.length<3;
  const label=safety.override?'SAFETY OVERRIDE':score>=82?'HIGH':score>=68?'BALANCED':score>=52?'CONSERVATIVE':'LOW';
  const bestFit=safety.override?'Pause performance recommendation': score>=85?'High-quality event-specific work':score>=72?'Controlled quality / technique':score>=58?'Reduced-load technique or aerobic work': 'Recovery / low-load movement';

  const present=(k)=>obs[k]!==''&&obs[k]!=null&&Number.isFinite(Number(obs[k]));
  const factors=[
    ['Sleep',norm.sleep,present('sleep')?`${Number(obs.sleep).toFixed(1)} h`:'Missing → neutral fallback'],['Energy',norm.energy,present('energy')?`${obs.energy}/10`:'Missing → neutral fallback'],['Soreness',norm.soreness,present('soreness')?`${obs.soreness}/10 reported`:'Missing → neutral fallback'],
    ['Stress',norm.stress,present('stress')?`${obs.stress}/10 reported`:'Missing → neutral fallback'],['Hydration',norm.hydration,present('hydration')?`${Math.round(Number(obs.hydration)*100)}% normalized`:'Missing → neutral fallback'],
    ['Resting pulse',norm.heart,!present('restingHr')?'Missing → neutral fallback':norm.hrDeviation==null?'No personal pulse baseline':`${norm.hrDeviation>=0?'+':''}${round(norm.hrDeviation*100,1)}% vs profile baseline`],['Prior load recovery',norm.loadRecovery,present('load')?`${obs.load}/10 yesterday`:'Missing → neutral fallback']
  ].map(([name,value,detail])=>({name,value:round(value,0),detail}));
  const sorted=[...factors].sort((a,b)=>a.value-b.value);
  const recommendations=[];
  if(safety.override) recommendations.push({kind:'danger',title:'Model abstains',text:safety.message});
  else {
    recommendations.push({kind:'primary',title:'State-aware suggestion',text:`${bestFit}. Treat this as a planning aid, not clearance.`});
    if(sorted[0].value<65) recommendations.push({kind:'caution',title:`Watch ${sorted[0].name.toLowerCase()}`,text:`It is the lowest normalized observation today (${sorted[0].value}/100).`});
    if(provisional) recommendations.push({kind:'info',title:'Build personal history',text:'Confidence is intentionally limited until at least three local check-ins exist.'});
  }
  const explanation={
    eventFamily:EVENT_DATA[event]?.family||'track & field', eventDemands:d, normalized:norm,
    currentProjection:current, priorState:prev, smoothingLambda:round(lambda,3), historyDepth:history.length, personalBaseline,
    formula:'z_t = λ_t z_(t-1) + (1 − λ_t) f(x_t, c_t)',
    boundary:'Daily wellness variables are evidence-informed and personally contextualized using compatible public athlete-monitoring domains (SoccerMon/PMData/REST). NRCD validates the separate performance-state mechanism; no dataset here establishes causal training effects, medical readiness, or injury prevention.', personalizationBoundary:norm.personalizationBoundary
  };
  return {version:STATE_VERSION,schemaVersion:STATE_SCHEMA_VERSION,timestamp:new Date().toISOString(),event,score,label,provisional,bestFit,confidence,dimensions,factors,recommendations,safety,personalBaseline,deviationFlags:personalBaseline.deviations,explanation,observation:{...obs},profileSnapshot:{...profile}};
}

export function transparentSessionBaseline(session, intensity, duration, tempF){
  const s=SESSION_DEMANDS[session]||SESSION_DEMANDS.speed;
  let score=100;
  score -= Math.max(0,Number(intensity)-6)*7;
  score -= Math.max(0,Number(duration)-75)*.18;
  score -= Math.max(0,Number(tempF)-82)*.8;
  score -= Math.max(0,s.load-.7)*24;
  return round(clamp(score,20,100),0);
}

export function sessionCompatibility(state, {session='speed',intensity=7,duration=75,temp=78}={}){
  const baseline=transparentSessionBaseline(session,intensity,duration,temp);
  if(!state) return {baseline,stateAware:null,uncertainty:100,label:'Waiting for state',text:'Complete a state update first.',adjustments:[]};
  if(state.safety.override) return {baseline,stateAware:null,uncertainty:100,label:'Model abstains',text:'A safety concern overrides session scoring.',adjustments:[state.safety.message],abstain:true};
  const sessionDemand=SESSION_DEMANDS[session]||SESSION_DEMANDS.speed;
  const d=state.dimensions;
  const capacity=(
    d.recovery*.21 + d.freshness*.20 + d.loadTolerance*.20 + d.stability*.12 +
    d.powerAvailability*(.14*(sessionDemand.power*.7+sessionDemand.speed*.3)) + d.aerobicDurability*(.13*sessionDemand.aerobic)
  )/(.73 + .14*(sessionDemand.power*.7+sessionDemand.speed*.3) + .13*sessionDemand.aerobic);
  const intensityPenalty=Math.max(0,Number(intensity)-capacity/12)*4.2;
  const durationPenalty=Math.max(0,Number(duration)-70)*(sessionDemand.load*.11);
  const heatPenalty=Math.max(0,Number(temp)-82)*(.32 + Number(intensity)*.035);
  const eventDemand=demand(state.event);
  const eventMatch=1-Math.min(1,Math.abs((eventDemand.speed+eventDemand.power)/2-(sessionDemand.speed+sessionDemand.power)/2));
  const matchBonus=(eventMatch-.5)*8;
  const stateAware=round(clamp(.48*baseline+.52*capacity-intensityPenalty-durationPenalty-heatPenalty+matchBonus,0,100),0);
  const uncertainty=round(100-state.confidence,0);
  const label=stateAware>=82?'Strong fit':stateAware>=68?'Good with monitoring':stateAware>=52?'Modify the plan':'Low compatibility';
  const adjustments=[];
  if(intensity>=8 && state.score<75) adjustments.push('Reduce intensity or increase recovery between high-quality reps.');
  if(duration>90 && d.loadTolerance<72) adjustments.push('Shorten total volume before changing technique quality.');
  if(temp>=88) adjustments.push('Heat adds uncertainty; use local heat-safety guidance and adjust conditions, breaks, or timing.');
  if(d.powerAvailability<62 && ['speed','speedend','jumps','throws','strength','hurdles'].includes(session)) adjustments.push('Power-related state is low relative to today’s session demand.');
  if(d.aerobicDurability<62 && ['tempo','distance','speedend'].includes(session)) adjustments.push('Aerobic-durability state is low relative to today’s session demand.');
  if(!adjustments.length) adjustments.push('No major state/session mismatch detected; preserve normal coach-led judgment.');
  return {baseline,stateAware,uncertainty,label,text:`State-aware compatibility is ${stateAware}/100 with ${state.confidence}% state confidence.`,adjustments,abstain:false,capacity:round(capacity,1)};
}

export function counterfactual(profile, baseObs, history, patch={}){
  const baseline=computeState(profile,baseObs,history);
  const scenarioObs={...baseObs,...patch};
  const scenario=computeState(profile,scenarioObs,history);
  return {baseline,scenario,delta:scenario.score-baseline.score,dimensionDelta:Object.fromEntries(DIMENSIONS.map(k=>[k,round(scenario.dimensions[k]-baseline.dimensions[k],1)])),warning:'Counterfactuals are model scenarios, not causal claims or promises of performance change.'};
}

export function stateDimensionLabels(){ return {...DISPLAY}; }
