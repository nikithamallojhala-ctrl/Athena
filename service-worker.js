const CACHE='athena-os-v2.5.0';
const CORE=[
  './','./index.html','./styles.css','./manifest.webmanifest','./assets/athena-mark.svg','./assets/pallas-mark.svg','./assets/founders/photos.json',
  './js/app.js','./js/utils.js','./js/data.js','./js/state-engine.js','./js/event-tools.js','./js/health.js','./js/research-ui.js','./js/prospective.js','./js/performance-log.js','./js/pallas.js','./js/experience.js',
  './data/derived/research_results.json','./data/derived/wellness_results.json','./data/derived/evidence_integrity.json','./assets/athena-192.png','./assets/athena-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok && new URL(event.request.url).origin===self.location.origin && !event.request.url.includes('nrcd_v2_joined.csv')){
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>cached)));
});
