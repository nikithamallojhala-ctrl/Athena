import { $, $$, toast } from './utils.js';

const SECTION_META={command:['01','ATHLETE STATE'],eventlab:['02','EVENT SYSTEMS'],intelligence:['03','INTERPRETATION'],research:['04','RESEARCH'],health:['05','SAFETY + HANDOFF'],methods:['06','METHODS'],about:['07','FOUNDERS']};

export function initExperience(){
  initFounderPhotos();
  initFounderContact();
  initSectionNavigation();
  initSurfaceSpotlights();
  initHeroMotion();
  initEvidenceCounters();
  $('[data-open-guide]')?.addEventListener('click',()=>$('#guideToggle')?.click());
  $('[data-open-pallas]')?.addEventListener('click',()=>$('#pallasToggle')?.click());
}

async function initFounderPhotos(){
  const variants={
    nikitha:['nikitha.jpg','nikitha.jpeg','nikitha.png','nikitha.webp','Nikitha.JPG','Nikitha.PNG'],
    shriyan:['shriyan.jpg','shriyan.jpeg','shriyan.png','shriyan.webp','Shriyan.JPG','Shriyan.PNG']
  };
  let configured={};
  try{const r=await fetch('assets/founders/photos.json',{cache:'no-store'});if(r.ok)configured=await r.json()}catch{}
  $$('[data-founder-photo]').forEach(img=>{
    const key=img.dataset.founderPhoto; const configuredFile=String(configured?.[key]||'').trim();
    const files=[configuredFile,...(variants[key]||[])].filter((x,i,a)=>x&&a.indexOf(x)===i); let i=0;
    const avatar=img.closest('.founder-avatar');
    const next=()=>{
      if(i>=files.length){img.hidden=true;avatar?.classList.add('photo-fallback');avatar?.setAttribute('title',`Add a founder image in assets/founders or update photos.json`);return;}
      img.hidden=false; img.src=`assets/founders/${encodeURIComponent(files[i++]).replaceAll('%2F','/')}`;
    };
    img.addEventListener('load',()=>{img.hidden=false;avatar?.classList.add('photo-loaded');avatar?.classList.remove('photo-fallback');avatar?.removeAttribute('title')});
    img.addEventListener('error',next);
    next();
  });
}

function initFounderContact(){
  $$('.founder-contact').forEach(btn=>btn.addEventListener('click',()=>{
    const user=btn.dataset.contactUser,domain=btn.dataset.contactDomain;
    if(!user||!domain){toast('Contact address unavailable');return;}
    const scheme=['mail','to',':'].join('');
    window.location.href=`${scheme}${user}@${domain}?subject=${encodeURIComponent('ATHENA OS inquiry')}`;
  }));
}

function initSectionNavigation(){
  Object.entries(SECTION_META).forEach(([id,[index,label]])=>{
    const heading=$(`#${id} .section-heading`); if(heading){heading.dataset.sectionIndex=index;heading.dataset.sectionLabel=label;}
  });
  const navLinks=$$('#primaryNav a[href^="#"]');
  const linkById=new Map(navLinks.map(a=>[a.getAttribute('href').slice(1),a]));
  const targets=[...linkById.keys()].map(id=>document.getElementById(id)).filter(Boolean);
  if('IntersectionObserver' in window){
    const spy=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      navLinks.forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current')});
      const active=linkById.get(visible.target.id); if(active){active.classList.add('active');active.setAttribute('aria-current','page');}
    },{rootMargin:'-25% 0px -60% 0px',threshold:[0,.05,.2,.5]});
    targets.forEach(s=>spy.observe(s));
  }
  let ticking=false;
  const updateProgress=()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const pct=Math.max(0,Math.min(100,(scrollY/max)*100));$('#sectionProgress')?.style.setProperty('width',`${pct}%`);ticking=false};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true}},{passive:true}); updateProgress();
}

function initSurfaceSpotlights(){
  if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  $$('.panel,.map-card,.founder-profile,.collab-manifest,.founder-contact-strip,.proof-stat,.signature-card').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--spot-x',`${e.clientX-r.left}px`);el.style.setProperty('--spot-y',`${e.clientY-r.top}px`)});
  });
}

function initHeroMotion(){
  const system=$('.hero-system'),consoleEl=$('.hero-console');
  if(!system||!consoleEl||!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  system.addEventListener('pointermove',e=>{const r=system.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;consoleEl.style.setProperty('--hero-rx',`${(-y*3.2).toFixed(2)}deg`);consoleEl.style.setProperty('--hero-ry',`${(x*4.2).toFixed(2)}deg`);});
  system.addEventListener('pointerleave',()=>{consoleEl.style.setProperty('--hero-rx','0deg');consoleEl.style.setProperty('--hero-ry','0deg')});
}

function initEvidenceCounters(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const targets=[
    ['#proofAthletes',27548],['#proofRecords',155109],['#proofSamples',65895]
  ].map(([selector,value])=>[document.querySelector(selector),value]).filter(([el])=>el);
  if(!targets.length||!('IntersectionObserver' in window))return;
  const fmt=n=>Math.round(n).toLocaleString();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const pair=targets.find(([el])=>el===entry.target); if(!pair)return;
      const [el,value]=pair,start=performance.now(),duration=850;
      const tick=now=>{const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3);el.textContent=fmt(value*eased);if(t<1)requestAnimationFrame(tick);else el.textContent=fmt(value)};
      requestAnimationFrame(tick); observer.unobserve(el);
    });
  },{threshold:.45});
  targets.forEach(([el])=>observer.observe(el));
}
