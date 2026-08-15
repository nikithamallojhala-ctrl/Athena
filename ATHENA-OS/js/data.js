export const EVENT_DATA = {
  '60m':{family:'sprint',demands:{speed:1,power:.9,aerobic:.1,technical:.55,coordination:.7}},
  '100m':{family:'sprint',demands:{speed:1,power:.95,aerobic:.15,technical:.6,coordination:.72}},
  '200m':{family:'sprint',demands:{speed:.95,power:.85,aerobic:.28,technical:.62,coordination:.7}},
  '400m':{family:'long sprint',demands:{speed:.82,power:.75,aerobic:.58,technical:.5,coordination:.55}},
  '800m':{family:'middle distance',demands:{speed:.55,power:.42,aerobic:.86,technical:.3,coordination:.35}},
  '1500m':{family:'middle distance',demands:{speed:.37,power:.28,aerobic:.96,technical:.28,coordination:.3}},
  '1600m':{family:'middle distance',demands:{speed:.35,power:.25,aerobic:.97,technical:.28,coordination:.3}},
  '3000m':{family:'distance',demands:{speed:.25,power:.18,aerobic:1,technical:.22,coordination:.25}},
  '3200m':{family:'distance',demands:{speed:.23,power:.16,aerobic:1,technical:.22,coordination:.24}},
  '5000m':{family:'distance',demands:{speed:.18,power:.12,aerobic:1,technical:.2,coordination:.22}},
  '60m Hurdles':{family:'hurdles',demands:{speed:.9,power:.88,aerobic:.14,technical:1,coordination:1}},
  '100m Hurdles':{family:'hurdles',demands:{speed:.88,power:.84,aerobic:.18,technical:1,coordination:1}},
  '110m Hurdles':{family:'hurdles',demands:{speed:.88,power:.84,aerobic:.18,technical:1,coordination:1}},
  '400m Hurdles':{family:'long hurdles',demands:{speed:.7,power:.64,aerobic:.68,technical:.9,coordination:.92}},
  '3000m Steeplechase':{family:'distance/hurdles',demands:{speed:.28,power:.3,aerobic:1,technical:.78,coordination:.8}},
  'Long Jump':{family:'jumps',demands:{speed:.93,power:1,aerobic:.08,technical:.92,coordination:.9}},
  'Triple Jump':{family:'jumps',demands:{speed:.78,power:1,aerobic:.1,technical:1,coordination:1}},
  'High Jump':{family:'jumps',demands:{speed:.5,power:1,aerobic:.05,technical:1,coordination:.95}},
  'Pole Vault':{family:'jumps',demands:{speed:.72,power:.92,aerobic:.08,technical:1,coordination:1}},
  'Shot Put':{family:'throws',demands:{speed:.18,power:1,aerobic:.04,technical:.92,coordination:.82}},
  'Discus':{family:'throws',demands:{speed:.16,power:.95,aerobic:.04,technical:1,coordination:.92}},
  'Javelin':{family:'throws',demands:{speed:.45,power:.95,aerobic:.05,technical:1,coordination:.92}},
  'Hammer':{family:'throws',demands:{speed:.1,power:.98,aerobic:.05,technical:1,coordination:1}},
  '4x100m':{family:'relay sprint',demands:{speed:1,power:.92,aerobic:.12,technical:.82,coordination:.92}},
  '4x200m':{family:'relay sprint',demands:{speed:.95,power:.84,aerobic:.27,technical:.76,coordination:.84}},
  '4x400m':{family:'relay long sprint',demands:{speed:.8,power:.72,aerobic:.62,technical:.58,coordination:.65}},
  '4x800m':{family:'relay middle distance',demands:{speed:.5,power:.38,aerobic:.9,technical:.4,coordination:.48}}
};
export const EVENTS=Object.keys(EVENT_DATA);
export const DEMAND_LABELS={speed:'Speed',power:'Power',aerobic:'Aerobic',technical:'Technical',coordination:'Coordination'};
export const SESSION_DEMANDS={
 speed:{speed:1,power:.85,aerobic:.15,technical:.55,load:.78},speedend:{speed:.85,power:.72,aerobic:.5,technical:.42,load:.9},tempo:{speed:.35,power:.25,aerobic:.82,technical:.2,load:.72},distance:{speed:.18,power:.12,aerobic:1,technical:.14,load:.78},hurdles:{speed:.75,power:.7,aerobic:.26,technical:1,load:.72},jumps:{speed:.7,power:1,aerobic:.1,technical:.92,load:.7},throws:{speed:.2,power:1,aerobic:.08,technical:.92,load:.68},strength:{speed:.3,power:.9,aerobic:.12,technical:.35,load:.75},recovery:{speed:.08,power:.08,aerobic:.28,technical:.12,load:.22}
};
export const HEALTH_CONCERNS={
 heat:{title:'Possible heat illness',steps:['Stop activity and move to a cooler place.','Tell a coach, athletic trainer, nurse, parent, or other trusted adult.','If symptoms are significant or worsening, seek prompt medical help.'],urgent:'Confusion, collapse, fainting, seizure, or severe worsening symptoms can be an emergency. Call emergency services and follow trained-adult instructions.'},
 head:{title:'Possible concussion after a hit',steps:['Leave activity and tell an adult.','Do not return to sport the same day if a concussion is suspected.','A healthcare professional should guide return to sport.'],urgent:'Emergency warning signs after a head injury include worsening neurologic symptoms, repeated vomiting, seizure, unusual confusion, loss of consciousness, or rapidly worsening condition.'},
 breathing:{title:'Breathing concern',steps:['Stop activity and sit or stand in a safe position.','Tell an adult immediately and follow an existing emergency action plan if one applies.','Use only medication prescribed for that person and as directed.'],urgent:'Severe breathing difficulty, blue/gray lips, fainting, inability to speak normally, or rapid worsening requires emergency help.'},
 cardiac:{title:'Chest pain, fainting, or unusual heart symptoms',steps:['Stop activity.','Tell an adult and seek prompt medical assessment.','Do not push through chest pain, fainting, or near-fainting.'],urgent:'Collapse, unresponsiveness, severe chest pain, or abnormal breathing can be an emergency. Call emergency services; trained responders may use CPR/AED as indicated.'},
 injury:{title:'Potentially serious injury',steps:['Stop activity and avoid unnecessary movement of a severely painful area.','Tell a coach, athletic trainer, nurse, or parent.','Seek professional assessment when pain, deformity, loss of function, or other serious signs are present.'],urgent:'Suspected neck/spine injury, uncontrolled bleeding, exposed bone, loss of feeling, severe deformity, or life-threatening concern requires emergency help.'}
};
export const DATASET_REGISTRY=[
 {name:'National Running Club Database (NRCD)',version:'v2.0.0',status:'PRIMARY · REANALYZED',purpose:'Longitudinal one-step-ahead running performance prediction.',supports:'Individual history, event context, race outcomes, some environment/meet context.',doesNot:'Sleep, soreness, stress, hydration, medical outcomes.',license:'CC BY 4.0',source:'https://github.com/National-Running-Club-Database/national_running_club_database_public_dataset'},
 {name:'SoccerMon',version:'v1 / Scientific Data 2024',status:'WELLNESS DOMAIN · PUBLIC EVIDENCE',purpose:'Longitudinal athlete wellness and training-load evidence layer.',supports:'17,002 daily wellness reports across elite women’s soccer, including fatigue, mood/readiness, sleep duration/quality, soreness and stress; separate training-load reports.',doesNot:'Validate ATHENA’s track performance model, establish causal effects, or provide medical clearance.',license:'Open dataset; see Zenodo record',source:'https://zenodo.org/records/10033832'},
 {name:'PMData',version:'MMSys 2020',status:'WELLNESS DOMAIN · ATHENA REANALYSIS',purpose:'Independent ATHENA next-day readiness validation plus longitudinal sports-logging compatibility check.',supports:'Five months from 16 people with PMSys wellness (fatigue, mood, readiness, sleep duration/quality, soreness, stress), session RPE and Fitbit data.',doesNot:'Serve as a large track-and-field outcome dataset, establish causality, or provide medical readiness; its 16-person cohort limits generalization.',license:'CC BY-NC 4.0 per source record',source:'https://datasets.simula.no/pmdata/'},
 {name:'REST — elite female football sleep dataset',version:'v4 · 2025',status:'SLEEP DOMAIN · EXTERNAL SUPPORT',purpose:'Objective sleep-focused external evidence.',supports:'21 elite female footballers monitored for 17 days with actigraphy, well-being, lifestyle context and daily hand-strength testing.',doesNot:'Validate all ATHENA readiness dimensions or track-event predictions.',license:'See Zenodo record',source:'https://zenodo.org/records/16937033'},
 {name:'Treadmill Maximal Exercise Tests — PhysioNet',version:'v1.0.1',status:'PHYSIOLOGY DOMAIN · IDENTIFIED',purpose:'Physiological-state extension and stress-test domain.',supports:'992 graded tests with HR, VO₂, CO₂, ventilation, speed and participant/context data.',doesNot:'The same longitudinal next-race target as NRCD; not mixed into the primary validation.',license:'Open access per PhysioNet record',source:'https://physionet.org/content/treadmill-exercise-cardioresp/1.0.1/'}
];

export const WELLNESS_EVIDENCE=[
 {name:'SoccerMon',role:'Athlete-specific longitudinal evidence',signals:['fatigue','readiness','sleep duration','sleep quality','soreness','stress','training load'],detail:'Two elite women’s soccer teams over two years. The dataset reports 17,002 daily wellness submissions and 33,849 subjective reports overall.',status:'Direct variable compatibility; external evidence, not an ATHENA causal claim.',source:'https://doi.org/10.5281/zenodo.10033832'},
 {name:'PMData',role:'Independent ATHENA wellness reanalysis domain',signals:['fatigue','mood','readiness','sleep duration','sleep quality','soreness','stress','session RPE','Fitbit sleep/HR'],detail:'Sixteen people followed for five months with sports logs plus wearable/lifelog data.',status:'ATHENA reanalysis now tests next-day readiness with temporal and leave-one-participant-out validation; the small cohort remains a major limitation.',source:'https://datasets.simula.no/pmdata/'},
 {name:'REST',role:'Objective sleep support',signals:['actigraphy','well-being','caffeine','screen time','hand strength'],detail:'Twenty-one elite female footballers followed continuously for 17 days.',status:'External objective sleep context only; ATHENA does not claim a reanalysis of REST in this release.',source:'https://doi.org/10.5281/zenodo.16937033'}
];

export const REFERENCES=[
 {label:'NRCD v2.0.0 datasheet',url:'https://github.com/National-Running-Club-Database/national_running_club_database_public_dataset/blob/main/DATASHEET.md'},
 {label:'CDC — Heat and Athletes',url:'https://www.cdc.gov/heat-health/risk-factors/heat-and-athletes.html'},
 {label:'CDC — Returning to Sports after concussion',url:'https://www.cdc.gov/heads-up/guidelines/returning-to-sports.html'},
 {label:'CDC — Sleep and Health',url:'https://www.cdc.gov/physical-activity-education/staying-healthy/sleep.html'},
 {label:'AHA — Target Heart Rates',url:'https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates'},
 {label:'NWS — Heat Index',url:'https://www.weather.gov/ama/heatindex'},
 {label:'MIT THINK 2025–26 Guidelines',url:'https://think.mit.edu/static_files/THINK_Program_Guidelines_2026.pdf'}
];
