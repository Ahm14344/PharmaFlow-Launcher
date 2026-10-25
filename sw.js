/* PharmaFlow launcher: instant start and offline shell. The portal itself always loads live. */
const CACHE='pf-launcher-v6.5.17';
const SHELL=['./','./index.html','./manifest.webmanifest','./pharmaflow-icon-180.png','./pharmaflow-icon-192.png','./pharmaflow-icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('version.json')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return;}
  // Stale-while-revalidate: open instantly from cache, refresh in the background.
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>hit);
    return hit||net;
  }));
});
