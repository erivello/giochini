/* =========================================================
   SCHERMO INTERO — file comune a tutti i giochini
   Uso, in fondo alla pagina del gioco:
     <script src="../schermo-intero.js" data-after="idPulsanteAudio"></script>
   - aggiunge un pulsante ⛶ subito dopo il pulsante indicato (con le sue stesse classi)
   - sui telefoni Android va a tutto schermo al primo tocco
   - su iPhone il browser non lo permette: il pulsante non compare
     (lì si apre a tutto schermo dall'icona sulla schermata Home)
   ========================================================= */
(function(){
  'use strict';
  const me = document.currentScript;
  const afterId = me && me.dataset.after;
  const root = document.documentElement;
  const canFull = !!(root.requestFullscreen || root.webkitRequestFullscreen);
  const isTouch = matchMedia('(pointer:coarse)').matches;

  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function enter(){
    const r = root.requestFullscreen ? root.requestFullscreen() : root.webkitRequestFullscreen && root.webkitRequestFullscreen();
    if (r && r.catch) r.catch(() => {});
  }
  function exit(){
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }

  function setup(){
    if (!canFull) return;
    // pulsante ⛶ accanto a quello indicato
    const ref = afterId && document.getElementById(afterId);
    if (ref){
      const b = document.createElement('button');
      b.id = 'fullBtn'; b.className = ref.className; b.type = 'button';
      b.title = 'Schermo intero'; b.setAttribute('aria-label', 'Schermo intero');
      b.textContent = '⛶';
      b.addEventListener('click', e => { e.stopPropagation(); isFull() ? exit() : enter(); });
      ref.after(b);
      const sync = () => { b.textContent = isFull() ? '🗗' : '⛶'; };
      document.addEventListener('fullscreenchange', sync);
      document.addEventListener('webkitfullscreenchange', sync);
    }
    // sui telefoni: al primo tocco va da solo a tutto schermo
    if (isTouch){
      const once = () => { removeEventListener('pointerup', once, true); if (!isFull()) enter(); };
      addEventListener('pointerup', once, true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
