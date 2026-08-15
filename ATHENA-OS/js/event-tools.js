import { clamp, round, mean, std, cv, parseClock, fmtSeconds, permutations } from './utils.js';

const SPRINT_PHASES={
  60:[['Drive',0,20,.39],['Transition',20,35,.24],['Max velocity',35,55,.29],['Finish',55,60,.08]],
  100:[['Drive',0,30,.37],['Transition',30,50,.21],['Max velocity',50,80,.29],['Finish',80,100,.13]],
  200:[['Acceleration',0,40,.25],['Build / bend',40,100,.28],['Max velocity',100,150,.24],['Finish',150,200,.23]],
  400:[['Acceleration',0,50,.145],['Settle',50,200,.345],['Commit',200,300,.255],['Finish',300,400,.255]]
};

export function buildSprintBlueprint(distance, goal, strength='max'){
  distance=Number(distance); goal=Number(goal);
  if(!SPRINT_PHASES[distance]||!Number.isFinite(goal)||goal<=0) throw new Error('Enter a valid sprint event and positive goal time.');
  const phases=SPRINT_PHASES[distance].map(([name,start,end,share])=>({name,start,end,share}));
  const strengthIndex={start:0,transition:1,max:2,finish:3}[strength]??2;
  const raw=phases.map((p,i)=>p.share*(i===strengthIndex?.96:1.0133));
  const sum=raw.reduce((a,b)=>a+b,0);
  let allocated=0;
  return phases.map((p,i)=>{
    let time=i===phases.length-1?goal-allocated:goal*raw[i]/sum;
    allocated+=time;
    return {...p,time:round(time,2),pace:round(time/(p.end-p.start),3),cue:[
      'Project smoothly; prioritize positions over forcing the first steps.',
      'Rise progressively and protect rhythm through transition.',
      'Stay tall and elastic; avoid chasing speed with tension.',
      'Preserve mechanics as fatigue rises; run through the line.'
    ][i]};
  });
}

const HURDLES={
  '60H':{label:'60m hurdles',hurdles:5,start:13.0,spacing:8.5,finish:13.0},
  '100H':{label:'100m hurdles',hurdles:10,start:13.0,spacing:8.5,finish:10.5},
  '110H':{label:'110m hurdles',hurdles:10,start:13.72,spacing:9.14,finish:14.02},
  '400H':{label:'400m hurdles',hurdles:10,start:45,spacing:35,finish:40}
};
export function buildHurdleRhythm(event, goal, allowance=.28){
  const h=HURDLES[event]; goal=Number(goal); allowance=Number(allowance);
  if(!h||!Number.isFinite(goal)||goal<=0) throw new Error('Enter a valid hurdle goal.');
  const outside=clamp(allowance,.18,.42);
  const startTime=goal*outside*.56, finishTime=goal*outside*.44, middle=goal-startTime-finishTime;
  const intervals=h.hurdles-1; const intervalTime=middle/intervals;
  const checkpoints=[];
  checkpoints.push({label:'Start → H1',distance:h.start,time:round(startTime,2),cumulative:round(startTime,2)});
  let cum=startTime;
  for(let i=1;i<=intervals;i++){cum+=intervalTime;checkpoints.push({label:`H${i} → H${i+1}`,distance:h.spacing,time:round(intervalTime,2),cumulative:round(cum,2)});}
  cum+=finishTime;checkpoints.push({label:`H${h.hurdles} → finish`,distance:h.finish,time:round(finishTime,2),cumulative:round(cum,2)});
  return {event:h.label,goal,intervalTarget:round(intervalTime,3),checkpoints,assumption:'This is a transparent rhythm allocation model, not a biomechanical prescription. Hurdle height, sex/category rules, individual stride pattern, and coaching context are not inferred.'};
}

export function buildPaceMatrix(distance, goalInput, strategy='even'){
  const distanceM=Number(distance), goal=parseClock(goalInput);
  if(!Number.isFinite(distanceM)||!Number.isFinite(goal)||goal<=0) throw new Error('Enter a valid distance and goal time.');
  const segment=distanceM<=1600?200:400;
  const count=Math.ceil(distanceM/segment);
  const distances=Array.from({length:count},(_,i)=>Math.min(segment,distanceM-i*segment));
  const n=distances.length;
  const shape=distances.map((_,i)=>{
    if(strategy==='negative') return 1.025-(i/(Math.max(n-1,1)))*.05;
    if(strategy==='positive') return .975+(i/(Math.max(n-1,1)))*.05;
    return 1;
  });
  const denom=distances.reduce((s,d,i)=>s+d*shape[i],0);
  const k=goal/denom;
  let cum=0;
  const rows=distances.map((d,i)=>{const sec=d*shape[i]*k;cum+=sec;return {segment:i+1,distance:d,split:sec,cumulative:cum,pace400:sec/d*400}});
  // Numerically force exact total by adjusting final split only.
  const drift=goal-rows.at(-1).cumulative;
  rows.at(-1).split+=drift; rows.at(-1).cumulative=goal;
  const rounded=rows.map(r=>({...r,split:round(r.split,2),cumulative:round(r.cumulative,2),pace400:round(r.pace400,2)}));
  const roundedDrift=round(goal-rounded.reduce((s,r)=>s+r.split,0),2);
  rounded.at(-1).split=round(rounded.at(-1).split+roundedDrift,2);
  rounded.at(-1).cumulative=round(goal,2);
  return {distance:distanceM,goal,strategy,rows:rounded,average400:round(goal/distanceM*400,2)};
}

export function summarizeAttempts(attempts=[]){
  const legal=attempts.filter(a=>!a.foul&&Number.isFinite(Number(a.mark))).map(a=>Number(a.mark));
  if(!attempts.length) return {count:0,legalCount:0,best:null,mean:null,sd:null,cv:null,consistency:null,trend:null};
  const best=legal.length?Math.max(...legal):null, avg=legal.length?mean(legal):null, sd=legal.length>1?std(legal):0;
  const first=legal.slice(0,Math.max(1,Math.floor(legal.length/2))), last=legal.slice(Math.max(1,Math.floor(legal.length/2)));
  const trend=last.length&&first.length?mean(last)-mean(first):0;
  return {count:attempts.length,legalCount:legal.length,best:best==null?null:round(best,2),mean:avg==null?null:round(avg,2),sd:round(sd,3),cv:legal.length>1?round(cv(legal)*100,2):null,consistency:legal.length>1?round(clamp(100-cv(legal)*260,0,100),0):null,trend:round(trend,2)};
}

const RELAY_LEG_PROFILES={
  '4x100m':[
    {name:'Leg 1 · blocks + curve',curve:1,exchange:.75,endurance:.25,pressure:.55,speed:1},
    {name:'Leg 2 · backstretch',curve:.15,exchange:1,endurance:.3,pressure:.55,speed:1},
    {name:'Leg 3 · curve',curve:1,exchange:1,endurance:.3,pressure:.65,speed:.95},
    {name:'Leg 4 · anchor',curve:.2,exchange:.75,endurance:.45,pressure:1,speed:1}
  ],
  '4x200m':[
    {name:'Leg 1 · blocks / bend',curve:.9,exchange:.7,endurance:.65,pressure:.5,speed:.9},
    {name:'Leg 2 · exchange / speed',curve:.45,exchange:1,endurance:.65,pressure:.55,speed:1},
    {name:'Leg 3 · bend / control',curve:.8,exchange:1,endurance:.72,pressure:.65,speed:.92},
    {name:'Leg 4 · anchor',curve:.4,exchange:.7,endurance:.78,pressure:1,speed:.95}
  ],
  '4x400m':[
    {name:'Leg 1 · blocks / controlled',curve:.72,exchange:.35,endurance:.9,pressure:.5,speed:.62},
    {name:'Leg 2 · traffic / position',curve:.5,exchange:.55,endurance:.9,pressure:.72,speed:.62},
    {name:'Leg 3 · bridge',curve:.5,exchange:.55,endurance:.93,pressure:.78,speed:.6},
    {name:'Leg 4 · anchor',curve:.45,exchange:.3,endurance:1,pressure:1,speed:.62}
  ],
  '4x800m':[
    {name:'Leg 1 · positioning',curve:.3,exchange:.2,endurance:1,pressure:.55,speed:.42},
    {name:'Leg 2 · stabilize',curve:.2,exchange:.25,endurance:1,pressure:.62,speed:.42},
    {name:'Leg 3 · bridge',curve:.2,exchange:.25,endurance:1,pressure:.72,speed:.42},
    {name:'Leg 4 · anchor',curve:.2,exchange:.2,endurance:1,pressure:1,speed:.45}
  ]
};
function legacyRelayObjective(event, order){
  // Reconstructed V1-style heuristic retained only as a transparent comparison baseline.
  // It uses the same reference-time inputs but simpler hand-authored leg penalties.
  let total=order.reduce((s,a)=>s+Number(a.time),0);
  order.forEach((a,leg)=>{
    if(event==='4x100m'||event==='4x200m'){
      total+=(10-Number(a.exchange||5))*.035;
      if(leg===0||leg===2) total+=(10-Number(a.curve||5))*.025;
    }else if(event==='4x400m'){
      if(leg===0) total+=(10-Number(a.curve||5))*.03;
      if(leg===3) total+=(10-Number(a.endurance||5))*.04+(10-Number(a.pressure||5))*.025;
    }else{
      if(leg===0) total+=(10-Number(a.pressure||5))*.05;
      if(leg===3) total+=(10-Number(a.endurance||5))*.07;
    }
  });
  return total;
}

function athleteFit(a,leg){
  const time=Number(a.time), speedScore=Number.isFinite(time)&&time>0?1/Math.max(time,.01):0;
  const quality=(Number(a.curve||5)/10)*leg.curve+(Number(a.exchange||5)/10)*leg.exchange+(Number(a.endurance||5)/10)*leg.endurance+(Number(a.pressure||5)/10)*leg.pressure;
  return quality + speedScore*leg.speed*8;
}
export function optimizeRelay(event, athletes=[]){
  if(athletes.length!==4) throw new Error('Relay Intelligence requires exactly four athletes.');
  if(athletes.some(a=>!a.name?.trim()||!Number.isFinite(Number(a.time))||Number(a.time)<=0)) throw new Error('Each athlete needs a name and positive reference time.');
  const profiles=RELAY_LEG_PROFILES[event]||RELAY_LEG_PROFILES['4x100m'];
  const orders=permutations(athletes).map(order=>{
    const fits=order.map((a,i)=>athleteFit(a,profiles[i]));
    const sumTime=order.reduce((s,a)=>s+Number(a.time),0);
    const fitScore=mean(fits);
    const exchangeRisk=event==='4x100m'||event==='4x200m'?mean(order.slice(0,3).map(a=>11-Number(a.exchange||5))):0;
    // Objective is minimized: reference time + interpretable role-fit penalties. It is not a race-time predictor.
    const objective=sumTime + (4-fitScore)*.48 + exchangeRisk*.035;
    const legacyObjective=legacyRelayObjective(event,order);
    return {order,objective,legacyObjective,referenceSum:sumTime,fitScore,exchangeRisk,legFits:fits.map((x,i)=>({leg:profiles[i].name,fit:round(x,3)}))};
  }).sort((a,b)=>a.objective-b.objective);
  const best=orders[0];
  const legacyRank=new Map([...orders].sort((a,b)=>a.legacyObjective-b.legacyObjective).map((r,i)=>[r.order.map(a=>a.name).join('|'),i+1]));
  const normalized=orders.map((r,i)=>({...r,rank:i+1,legacyRank:legacyRank.get(r.order.map(a=>a.name).join('|')),objective:round(r.objective,3),legacyObjective:round(r.legacyObjective,3),referenceSum:round(r.referenceSum,2),fitScore:round(r.fitScore,3),delta:round(r.objective-best.objective,3)}));
  const nearTieThreshold=.05;
  const nearTies=normalized.filter(r=>r.delta<=nearTieThreshold).map(r=>({rank:r.rank,order:r.order.map(a=>a.name),delta:r.delta}));
  return {event,profiles,orders:normalized,best:normalized[0],searchSpace:24,method:'Exact enumeration of all 4! = 24 permutations',objective:'minimize reference-time sum + role-fit penalty + exchange-risk penalty',legacyComparison:'Reconstructed V1 hand-authored penalty heuristic, shown only as a baseline comparison.',nearTieThreshold,nearTies,caution:'The score ranks roster orderings under declared assumptions; it is not a validated prediction of relay finish time.'};
}

export function relaySensitivity(event, athletes=[]){
  const base=optimizeRelay(event,athletes);
  const fields=['curve','exchange','endurance','pressure'];
  const wins=new Map(base.orders.map(o=>[o.order.map(a=>a.name).join(' → '),0]));
  const scenarios=[];
  for(const field of fields){
    for(const delta of [-1,1]){
      const shifted=athletes.map(a=>({...a,[field]:clamp(Number(a[field]||5)+delta,1,10)}));
      const result=optimizeRelay(event,shifted); const key=result.best.order.map(a=>a.name).join(' → ');
      wins.set(key,(wins.get(key)||0)+1); scenarios.push({field,delta,winner:key});
    }
  }
  const baseKey=base.best.order.map(a=>a.name).join(' → ');
  return {base:baseKey,stableScenarios:scenarios.filter(s=>s.winner===baseKey).length,total:scenarios.length,wins:[...wins.entries()].filter(([,n])=>n).sort((a,b)=>b[1]-a[1]),scenarios};
}

export function formatPaceRows(matrix){ return matrix.rows.map(r=>({...r,splitText:fmtSeconds(r.split),cumulativeText:fmtSeconds(r.cumulative),paceText:fmtSeconds(r.pace400)})); }
