/* =========================================================
   SERVICE WORKER — salva i giochi sul telefono, così:
   - si possono installare come app;
   - funzionano anche senza internet (dopo la prima apertura).
   Le pagine si prendono da internet se c'è (così arrivano le novità),
   tutto il resto dalla memoria del telefono, aggiornandola dietro le quinte.
   Se aggiungi un gioco: metti i suoi file in FILES e cambia VERSIONE.
   ========================================================= */
const VERSIONE = 'giochini-1';
const FILES = [
  './', 'index.html', 'app.js', 'schermo-intero.js', 'manifest.webmanifest',
  'icone/icona-48.png', 'icone/icona-180.png', 'icone/icona-192.png', 'icone/icona-512.png',
  'il-pescatore/index.html', 'il-pescatore/3d.html', 'il-pescatore/gioco-comune.js',
  'cavalli/index.html',
  'uomo-ragno/index.html',
  'brumme/index.html', 'brumme/3d.html', 'brumme/garage.html', 'brumme/paese.html', 'brumme/strada.html',
  'brumme/comune.css', 'brumme/comune.js',
];
// librerie da internet usate dai giochi in 3D
const ESTERNI = [
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSIONE);
    await c.addAll(FILES);
    await Promise.all(ESTERNI.map(u => fetch(u, { mode:'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSIONE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  if (req.headers.has('range') || /\.mp3(\?|$)/.test(req.url)) return;   // la musica non si tocca
  if (req.mode === 'navigate') e.respondWith(primaInternet(req));
  else e.respondWith(primaMemoria(e, req));
});

// pagine: da internet se c'è, altrimenti dalla memoria
async function primaInternet(req){
  const c = await caches.open(VERSIONE);
  try {
    const r = await fetch(req);
    if (r.ok) c.put(new URL(req.url).pathname, r.clone());
    return r;
  } catch(err){
    return (await c.match(new URL(req.url).pathname, { ignoreSearch:true })) ||
           (await c.match(req, { ignoreSearch:true })) ||
           (await c.match('./')) || Response.error();
  }
}
// tutto il resto: subito dalla memoria, e intanto si aggiorna da internet
async function primaMemoria(e, req){
  const c = await caches.open(VERSIONE);
  const salvato = await c.match(req);
  const nuovo = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => null);
  if (salvato){ e.waitUntil(nuovo); return salvato; }
  return (await nuovo) || Response.error();
}
