const C="herb-demo-v1",F=["./","index.html","manifest.json","icon.svg","icon-192.png","icon-512.png",
  "vendor/ort.min.js","vendor/ort-wasm-simd.wasm","vendor/ort-wasm-simd-threaded.wasm","vendor/ocr_det.onnx","vendor/ocr_rec.onnx","vendor/ocr_keys.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* 文字辨識要多執行緒就要這兩個標頭；credentialless 才不會擋掉跨網域的 no-cors 連線 */
const iso=r=>{if(!r||r.type==="opaque"||!r.status)return r;const h=new Headers(r.headers);h.set("Cross-Origin-Opener-Policy","same-origin");h.set("Cross-Origin-Embedder-Policy","credentialless");return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h})};
/* network-first: 連得到電腦就拿新版並更新快取，連不到就用快取（離線）
   App 頁面不管從哪個網址開，都存在同一份 index.html，離線才不會開到舊版 */
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const page=e.request.mode==="navigate",key=page?"index.html":e.request;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&!new URL(e.request.url).search||r.ok&&page){const c=r.clone();e.waitUntil(caches.open(C).then(x=>x.put(key,c)))}return r})
    .catch(()=>caches.match(key,{ignoreSearch:true})).then(iso));
});
