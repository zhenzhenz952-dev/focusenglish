'use strict';
importScripts('offline-core.js','offline-manifest.js');
const manifest = self.FOCUS_OFFLINE_MANIFEST;
const SHELL = `focusenglish-shell-${manifest.version}`;
const MEDIA = 'focusenglish-media-v1';
const DICTIONARY = `focusenglish-dictionary-${manifest.dictionaryVersion}`;
const absolute = asset => ({...asset,url:new URL(asset.url,self.registration.scope).href});
const shell = new Map(manifest.shell.map(item=>[absolute(item).url,absolute(item)]));
const documents = new Map();
for(const asset of shell.values())if(asset.kind==='html' && asset.url.endsWith('.html')){
  documents.set(asset.url.replace(/\.html$/,''),asset);
  if(asset.url.endsWith('/index.html'))documents.set(asset.url.replace(/index\.html$/,''),asset);
}
const media = new Map(manifest.audio.map(item=>[absolute(item).url,absolute(item)]));
const dictionary = new Map(manifest.dictionary.map(item=>[absolute(item).url,absolute(item)]));
const entry = new URL('index.html',self.registration.scope).href;

async function restoreMatching(cache) {
  const prior=(await caches.keys()).filter(name=>name.startsWith('focusenglish-shell-')&&name!==SHELL);
  for(const asset of shell.values()){
    if(!asset.sha256 || await cache.match(asset.url))continue;
    for(const name of prior){
      const old=await caches.open(name);
      const candidate=await old.match(asset.url) || (asset.legacyURL && await old.match(new URL(asset.legacyURL,self.registration.scope).href));
      if(!candidate)continue;
      const blob=await candidate.clone().blob();
      if(blob.size!==asset.bytes)continue;
      const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
      if([...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')!==asset.sha256)continue;
      await cache.put(asset.url,candidate);break;
    }
  }
}
async function discardOldShellsIfReady(){
  if(manifest.bootstrap){
    const cache=await caches.open(SHELL);
    for(const asset of shell.values())if(!await cache.match(asset.url))return;
  }
  for(const name of await caches.keys())if(name.startsWith('focusenglish-shell-')&&name!==SHELL)await caches.delete(name);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Each release owns a new cache. A failed installation cannot replace the active release.
    const cache = await caches.open(SHELL);
    try {
      if(manifest.bootstrap)await restoreMatching(cache);
      for(const item of manifest.bootstrap||manifest.shell){const asset=absolute(item);if(!await cache.match(asset.url))await FocusOffline.cacheAsset(cache,asset);}
    } catch (error) {
      // The browser will not activate a failed worker. A local pack can be
      // writing verified study members concurrently; keep those resumable.
      if(!manifest.bootstrap)await caches.delete(SHELL);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Downloaded media, dictionary shards and device-local learning records are retained.
    await discardOldShellsIfReady();
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type==='SKIP_WAITING') event.waitUntil(self.skipWaiting());
  if (event.data?.type==='PACK_IMPORTED') event.waitUntil(discardOldShellsIfReady());
  if (event.data?.type==='FOCUS_GET_VERSION') {event.ports?.[0]?.postMessage({version:manifest.version});event.ports?.[0]?.close();}
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method!=='GET' || url.origin!==self.location.origin) return;
  const isEntry = url.pathname===new URL(self.registration.scope).pathname || url.pathname===new URL(entry).pathname;
  if (request.mode==='navigate' && isEntry) {
    event.respondWith((async()=> (await caches.open(SHELL)).match(entry).then(hit=>hit || fetch(request)))()); return;
  }
  const key = url.origin+url.pathname;
  if (media.has(key)) {
    event.respondWith((async()=>{
      const cached = await (await caches.open(MEDIA)).match(key);
      if (cached) return FocusOffline.rangeResponse(cached,request.headers.get('Range'));
      try {return await fetch(request);} catch (_) {return new Response('这份音频尚未下载，请联网后保存。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
    })()); return;
  }
  const shellAsset=shell.get(key)||documents.get(key);
  if (shellAsset) {
    event.respondWith((async()=> (await caches.open(SHELL)).match(shellAsset.url).then(hit=>hit || fetch(request)))()); return;
  }
  if (dictionary.has(key)) {
    // Explicit cacheAsset downloads own validation, writes and cancellation in
    // the caller. Let the browser carry that request's AbortSignal to network.
    if(request.cache==='no-store')return;
    event.respondWith((async()=>{
      const cache = await caches.open(DICTIONARY);
      const cached = await cache.match(key); if(cached)return cached;
      try {await FocusOffline.cacheAsset(cache,dictionary.get(key));return await cache.match(key);}
      catch(_){return new Response('{"error":"dictionary_not_downloaded"}',{status:503,headers:{'Content-Type':'application/json'}});}
    })());
  }
});
