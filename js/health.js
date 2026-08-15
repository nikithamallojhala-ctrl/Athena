import { clamp, mean, round } from './utils.js';
import { HEALTH_CONCERNS } from './data.js';

export function heatIndexF(tempF, rh){
  const T=Number(tempF), R=clamp(Number(rh),0,100);
  if(!Number.isFinite(T)) return NaN;
  // NWS simple approximation before applying Rothfusz regression.
  const simple=.5*(T+61+(T-68)*1.2+R*.094);
  const avg=(simple+T)/2;
  if(avg<80) return round(avg,1);
  let HI=-42.379+2.04901523*T+10.14333127*R-.22475541*T*R-.00683783*T*T-.05481717*R*R+.00122874*T*T*R+.00085282*T*R*R-.00000199*T*T*R*R;
  if(R<13 && T>=80 && T<=112){ HI-=((13-R)/4)*Math.sqrt((17-Math.abs(T-95))/17); }
  else if(R>85 && T>=80 && T<=87){ HI+=((R-85)/10)*((87-T)/5); }
  return round(HI,1);
}

export function heatContext(tempF,rh,{duration=60,intensity=2}={}){
  const hi=heatIndexF(tempF,rh); const dur=Number(duration), inten=Number(intensity);
  let band='Lower heat-index range', tone='ok';
  if(hi>=103){band='Danger range';tone='danger';}
  else if(hi>=90){band='Extreme caution range';tone='warn';}
  else if(hi>=80){band='Caution range';tone='caution';}
  const modifiers=[];
  if(dur>=90) modifiers.push('Longer planned exposure increases heat-management importance.');
  if(inten>=3) modifiers.push('Hard exercise increases metabolic heat load.');
  if(Number(tempF)>=90) modifiers.push('Direct sun can make conditions feel hotter than shade-based Heat Index estimates.');
  return {heatIndex:hi,band,tone,modifiers,note:'Heat Index is a shade-based environmental screening metric, not WBGT and not a personalized safe/unsafe cutoff. Follow local school/team heat policies, coaching/medical guidance, acclimatization, hydration, and symptom monitoring.'};
}

export function heartRateGuide(age){
  const a=Number(age); if(!Number.isFinite(a)||a<1) return null;
  const max=Math.round(220-a);
  return {max,moderate:[Math.round(max*.50),Math.round(max*.70)],vigorous:[Math.round(max*.70),Math.round(max*.85)],note:'Population estimate only; individual maximum heart rate can differ.'};
}

export function sleepSummary(hours=[],age=16){
  const vals=hours.map(Number).filter(Number.isFinite);
  const avg=vals.length?mean(vals):0; const reference=Number(age)>=13&&Number(age)<=18?[8,10]:[7,9];
  const inBand=vals.filter(v=>v>=reference[0]&&v<=reference[1]).length;
  return {n:vals.length,average:round(avg,1),reference,inBand,consistency:vals.length?round(inBand/vals.length*100,0):0,note:Number(age)>=13&&Number(age)<=18?'CDC educational guidance lists 8–10 hours per 24 hours for ages 13–18. Individual needs vary.':'This display is educational and not a sleep disorder assessment.'};
}

export function concernInfo(key){ return HEALTH_CONCERNS[key]||HEALTH_CONCERNS.heat; }

export const SYMPTOMS=[
  'Dizziness / lightheadedness','Headache','Nausea / vomiting','Confusion / unusual behavior','Breathing difficulty','Chest discomfort','Fainted / nearly fainted','Severe or worsening pain','Weakness / coordination change','Other concerning change'
];

export function buildSBAR(input){
  const symptoms=(input.symptoms||[]).filter(Boolean);
  const required=[input.name,input.event,input.situation,input.onset,input.status,input.request];
  const completeness=Math.round(required.filter(v=>String(v||'').trim()).length/required.length*100);
  const urgent=/Fainted|Breathing is difficult|Confused/i.test(input.status||'') || symptoms.some(s=>/chest|fainted|confusion|breathing/i.test(s));
  const text=[
    `S — Situation: ${input.situation||'Not entered'} Activity/event: ${input.event||'Not entered'}. Onset: ${input.onset||'Not entered'}.`,
    `B — Background: ${input.background||'No relevant background entered.'}`,
    `A — Current observations: ${input.status||'Not entered'}. Pain/discomfort reported: ${input.pain ?? '—'}/10. Symptoms: ${symptoms.length?symptoms.join(', '):'none selected'}. Actions already taken: ${input.actions||'none entered'}.`,
    `R — Request: ${input.request||'Please assess and advise.'}`
  ].join('\n\n');
  return {text,completeness,urgent,missing:[!input.name?'athlete name':null,!input.event?'activity/event':null,!input.situation?'situation':null,!input.onset?'onset':null,!input.status?'current status':null,!input.request?'request':null].filter(Boolean),caution:'SBAR organizes reported information; it does not determine diagnosis or urgency. If there is an emergency or rapid worsening, get immediate adult/emergency help.'};
}
