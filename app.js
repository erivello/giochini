/* =========================================================
   APP — file comune a tutte le pagine dei giochini.
   Online (https) attiva il service worker (sw.js): i giochi si
   possono installare come app e vanno anche senza internet.
   Nella pagina iniziale mostra il pulsante "Installa" quando il
   browser lo permette (Chrome su Android e computer).
   ========================================================= */
(function(){
  'use strict';
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  const base = new URL('.', document.currentScript.src);   // la cartella principale dei giochini
  addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname }).catch(() => {});
  });
  let richiesta = null;
  addEventListener('beforeinstallprompt', e => {
    const b = document.getElementById('installa'); if (!b) return;
    e.preventDefault(); richiesta = e; b.hidden = false;
    b.onclick = async () => { b.hidden = true; richiesta.prompt(); await richiesta.userChoice; richiesta = null; };
  });
  addEventListener('appinstalled', () => { const b = document.getElementById('installa'); if (b) b.hidden = true; });
})();
