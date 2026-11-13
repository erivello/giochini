/* =========================================================
   BRUMMÈ — codice comune a tutti i giochi delle macchinine
   - la macchinina salvata (forma, colore, ruote, faccina)
   - disegno della macchinina su canvas
   - suoni (fatti al volo, nessun file) e voce che parla
   - coriandoli / bolle / stelline
   ========================================================= */
(function(){
'use strict';

/* ---------------- salvataggio ---------------- */
const KEY = 'brumme';
const save = { car:{ body:'auto', color:'rosso', wheels:'normali', face:'felice' }, sound:true, stars:0 };
try {
  const s = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (s.car) Object.assign(save.car, s.car);
  if (typeof s.sound === 'boolean') save.sound = s.sound;
  if (s.stars) save.stars = s.stars | 0;
  if (typeof s.tilt === 'boolean') save.tilt = s.tilt;
} catch(e) {}
function persist(){ try { localStorage.setItem(KEY, JSON.stringify(save)); } catch(e) {} }

/* ---------------- i pezzi della macchinina ---------------- */
const COLORS = [
  { id:'rosso',     hex:'#e8322f', nome:'Rosso' },
  { id:'blu',       hex:'#2f6fe8', nome:'Blu' },
  { id:'giallo',    hex:'#ffcc1a', nome:'Giallo' },
  { id:'verde',     hex:'#2fbf55', nome:'Verde' },
  { id:'arancione', hex:'#ff8a1a', nome:'Arancione' },
  { id:'rosa',      hex:'#ff6fb5', nome:'Rosa' },
  { id:'viola',     hex:'#8a4fe0', nome:'Viola' },
];
const BODIES = [
  { id:'auto',   nome:'Macchina' },
  { id:'corsa',  nome:'Macchina da corsa' },
  { id:'camion', nome:'Camion' },
  { id:'bus',    nome:'Autobus' },
  { id:'ruspa',  nome:'Ruspa' },
];
const WHEELS = [
  { id:'normali', nome:'Ruote' },
  { id:'giganti', nome:'Ruote giganti' },
  { id:'stella',  nome:'Ruote a stella' },
];
const FACES = [
  { id:'felice',     nome:'Felice' },
  { id:'ride',       nome:'Ride!' },
  { id:'stupito',    nome:'Oh!' },
  { id:'occhiolino', nome:'Occhiolino' },
];
const colorHex = id => (COLORS.find(c => c.id === id) || COLORS[0]).hex;
const pick = a => a[Math.floor(Math.random() * a.length)];
function randomCar(){ return { body:pick(BODIES).id, color:pick(COLORS).id, wheels:pick(WHEELS).id, face:pick(FACES).id }; }

/* ---------------- colori ---------------- */
function shade(hex, f){
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
const INK = '#1d2b36', GLASS = '#bfe8ff';

/* ---------------- disegno ---------------- */
function rr(c, x, y, w, h, r){
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function fs(c, fill, lw){ c.fillStyle = fill; c.fill(); c.lineWidth = lw || 4; c.strokeStyle = INK; c.stroke(); }

function drawWheel(c, x, R, type, rot){
  c.save(); c.translate(x, 0);
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); fs(c, '#2a2f3a');
  c.rotate(rot || 0);
  if (type === 'giganti'){
    c.fillStyle = '#4a5160';
    for (let i = 0; i < 10; i++){ c.save(); c.rotate(i * Math.PI / 5); c.fillRect(-4, -R + 1, 8, 7); c.restore(); }
  }
  if (type === 'stella'){
    c.beginPath();
    for (let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, rr2 = i % 2 ? R * 0.28 : R * 0.66; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
    c.closePath(); fs(c, '#ffd43b', 3);
  } else {
    c.beginPath(); c.arc(0, 0, R * 0.48, 0, Math.PI * 2); fs(c, '#d5dce6', 3);
    c.fillStyle = '#7d8796';
    for (let i = 0; i < 4; i++){ c.beginPath(); c.arc(Math.cos(i * Math.PI / 2) * R * 0.25, Math.sin(i * Math.PI / 2) * R * 0.25, R * 0.07 + 1, 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
}

// faccina: cx,cy centro, sz scala. st.blink chiude gli occhi, st.happy = ride
function drawFace(c, cx, cy, sz, face, st){
  st = st || {};
  if (st.happy) face = 'ride';
  c.save(); c.translate(cx, cy); c.scale(sz, sz);
  c.lineCap = 'round'; c.lineWidth = 3.5; c.strokeStyle = INK;
  const eye = (ex, open, big) => {
    if (!open || st.blink){
      c.beginPath(); c.arc(ex, -2, 7, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); return;
    }
    const r = big ? 11 : 9;
    c.beginPath(); c.arc(ex, -4, r, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(ex + (big ? 0 : 2), -3, big ? 4 : 5, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.arc(ex + (big ? 1.5 : 3.5), -5, 1.6, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    c.lineWidth = 3.5;
  };
  if (face === 'ride'){
    eye(-13, false); eye(13, false);
    c.beginPath(); c.moveTo(-10, 8); c.quadraticCurveTo(0, 26, 10, 8); c.closePath(); c.fillStyle = '#b8323a'; c.fill(); c.stroke();
  } else if (face === 'stupito'){
    eye(-14, true, true); eye(14, true, true);
    c.beginPath(); c.ellipse(0, 15, 5, 6, 0, 0, Math.PI * 2); c.fillStyle = '#b8323a'; c.fill(); c.stroke();
  } else if (face === 'occhiolino'){
    eye(-13, true); eye(13, false);
    c.beginPath(); c.arc(0, 7, 9, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    c.beginPath(); c.ellipse(3, 16, 4, 5, 0, 0, Math.PI * 2); c.fillStyle = '#ff7b8a'; c.fill(); c.lineWidth = 2.5; c.stroke();
  } else {
    eye(-13, true); eye(13, true);
    c.beginPath(); c.arc(0, 6, 10, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  }
  // guance
  c.globalAlpha = 0.35; c.fillStyle = '#ff6f8a';
  c.beginPath(); c.arc(-22, 8, 4.5, 0, Math.PI * 2); c.arc(22, 8, 4.5, 0, Math.PI * 2); c.fill();
  c.restore();
}

// ogni forma: posizione ruote, faro, faccina e come disegnare la carrozzeria
const SHAPES = {
  auto: {
    wx:[-60, 62], light:[92, -24], face:[-4, -63, 0.82],
    draw(c, col, st){
      c.beginPath(); c.moveTo(-62, -42); c.lineTo(-46, -88); c.quadraticCurveTo(-14, -94, 22, -88); c.lineTo(54, -42); c.closePath(); fs(c, col);
      c.beginPath(); c.moveTo(-50, -46); c.lineTo(-38, -80); c.quadraticCurveTo(-12, -84, 16, -80); c.lineTo(42, -46); c.closePath(); fs(c, GLASS, 3);
      rr(c, -102, -48, 204, 54, 20); fs(c, col);
      c.beginPath(); c.moveTo(-6, -46); c.lineTo(-6, -8); c.lineWidth = 3; c.strokeStyle = shade(col, -0.35); c.stroke();
      rr(c, 2, -36, 14, 5, 2.5); c.fillStyle = shade(col, -0.35); c.fill();
      rr(c, -104, -38, 10, 14, 4); fs(c, '#ff4d4d', 3);
      rr(c, -106, -6, 212, 12, 6); fs(c, '#aab4c3', 3);
    }
  },
  corsa: {
    wx:[-64, 66], light:[100, -18], face:[-10, -58, 0.74],
    draw(c, col, st){
      rr(c, -112, -66, 34, 9, 4); fs(c, shade(col, -0.25), 3);
      c.fillStyle = INK; c.fillRect(-98, -60, 6, 22);
      c.beginPath(); c.ellipse(-10, -42, 44, 36, 0, Math.PI, 0); fs(c, GLASS, 3);
      c.beginPath(); c.moveTo(-104, -4); c.lineTo(-106, -40); c.lineTo(-44, -44); c.quadraticCurveTo(28, -50, 108, -24); c.quadraticCurveTo(116, -6, 102, -2); c.closePath(); fs(c, col);
      c.beginPath(); c.moveTo(-100, -28); c.lineTo(104, -16); c.lineWidth = 7; c.strokeStyle = '#fff'; c.stroke();
      c.beginPath(); c.arc(30, -24, 12, 0, Math.PI * 2); fs(c, '#fff', 3);
      c.fillStyle = INK; c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', 30, -23);
    }
  },
  camion: {
    wx:[-78, -36, 70], light:[100, -26], face:[60, -78, 0.66],
    draw(c, col, st){
      rr(c, -110, -104, 128, 96, 8); fs(c, shade(col, 0.6));
      c.fillStyle = col; c.fillRect(-108, -66, 124, 14);
      rr(c, -112, -14, 220, 14, 5); fs(c, '#56606e', 3);
      c.beginPath(); c.moveTo(24, -6); c.lineTo(24, -108); c.lineTo(70, -108); c.lineTo(106, -62); c.lineTo(106, -6); c.closePath(); fs(c, col);
      c.beginPath(); c.moveTo(34, -98); c.lineTo(66, -98); c.lineTo(94, -60); c.lineTo(34, -60); c.closePath(); fs(c, GLASS, 3);
    }
  },
  bus: {
    wx:[-70, 70], light:[104, -26], face:[86, -76, 0.5],
    draw(c, col, st){
      rr(c, -112, -112, 224, 108, 18); fs(c, col);
      c.fillStyle = shade(col, 0.75); c.fillRect(-110, -48, 220, 10);
      for (let i = 0; i < 3; i++){
        rr(c, -100 + i * 44, -98, 38, 36, 7); fs(c, GLASS, 3);
        c.beginPath(); c.arc(-81 + i * 44, -74, 8, 0, Math.PI * 2); c.fillStyle = ['#f2c19c', '#c98b5e', '#ffd9b3'][i]; c.fill();
      }
      rr(c, 36, -98, 26, 88, 6); fs(c, shade(col, -0.2), 3);
      rr(c, 40, -94, 18, 36, 4); fs(c, GLASS, 2.5);
      rr(c, 68, -100, 38, 52, 8); fs(c, GLASS, 3);
      rr(c, -114, -8, 228, 10, 5); fs(c, '#aab4c3', 3);
    }
  },
  ruspa: {
    wx:[-58, 22], light:[50, -40], face:[-34, -86, 0.66],
    draw(c, col, st){
      const arm = st.arm || 0;
      c.save(); c.translate(36, -56); c.rotate(0.35 - arm * 0.75);
      rr(c, -6, -9, 86, 18, 7); fs(c, shade(col, -0.2));
      c.translate(80, 0); c.rotate(-0.35 + arm * 0.75);
      c.beginPath(); c.moveTo(-8, -26); c.lineTo(20, -24); c.quadraticCurveTo(34, 0, 18, 26); c.lineTo(-8, 22); c.closePath(); fs(c, '#8a93a1');
      c.restore();
      c.fillStyle = INK; c.fillRect(-86, -78, 9, 30);
      rr(c, -94, -54, 144, 50, 10); fs(c, col);
      rr(c, -74, -122, 76, 72, 10); fs(c, col);
      rr(c, -64, -112, 56, 50, 8); fs(c, GLASS, 3);
      c.beginPath(); c.arc(-36, -122, 9, Math.PI, 0); fs(c, (st.t || 0) % 0.6 < 0.3 ? '#ffb020' : '#ff7a00', 3);
      rr(c, -98, -8, 156, 12, 6); fs(c, '#56606e', 3);
    }
  },
};

/* drawCar(ctx, car, x, y, scala, stato)
   (x,y) = punto a terra al centro della macchinina; guarda verso destra.
   stato: wheelRot, squash, blink, happy, lights, flip, arm, t */
function drawCar(c, car, x, y, s, st){
  st = st || {};
  const sh = SHAPES[car.body] || SHAPES.auto;
  const R = car.wheels === 'giganti' ? 34 : 23;
  const col = colorHex(car.color);
  c.save(); c.translate(x, y); c.scale(s * (st.flip ? -1 : 1), s);
  if (!st.noShadow){
    c.beginPath(); c.ellipse(0, 2, 108, 10, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill();
  }
  const sq = st.squash || 0;
  c.scale(1 + sq, 1 - sq);
  c.translate(0, -R - (st.lift || 0));
  if (st.lights){
    const [lx, ly] = sh.light;
    const g = c.createLinearGradient(lx, 0, lx + 300, 0);
    g.addColorStop(0, 'rgba(255,240,150,.75)'); g.addColorStop(1, 'rgba(255,240,150,0)');
    c.beginPath(); c.moveTo(lx, ly - 6); c.lineTo(lx + 300, ly - 60); c.lineTo(lx + 300, ly + 70); c.lineTo(lx, ly + 6); c.closePath(); c.fillStyle = g; c.fill();
  }
  c.lineJoin = 'round';
  sh.draw(c, col, st);
  const [lx, ly] = sh.light;
  c.beginPath(); c.arc(lx, ly, 7, 0, Math.PI * 2); fs(c, st.lights ? '#fffbd0' : '#ffe680', 3);
  const [fx, fy, fz] = sh.face;
  drawFace(c, fx, fy, fz, car.face, st);
  sh.wx.forEach(wx => drawWheel(c, wx, R, car.wheels, st.wheelRot || 0));
  c.restore();
}
// altezza totale (per centrare i disegni)
function carHeight(car){ return ({ auto:94, corsa:70, camion:110, bus:114, ruspa:132 }[car.body] || 100) + (car.wheels === 'giganti' ? 34 : 23); }

/* ---------------- audio ---------------- */
let ac = null;
function audio(){
  if (!save.sound) return null;
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  } catch(e){ return null; }
  return ac;
}
function tone(f, t0, dur, type, vol, f2){
  const a = audio(); if (!a) return;
  const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}
let noiseBuf = null;
function getNoise(a){
  if (!noiseBuf){ noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  return noiseBuf;
}
function noise(dur, f1, f2, vol, t0){
  const a = audio(); if (!a) return;
  const t = a.currentTime + (t0 || 0), s = a.createBufferSource(); s.buffer = getNoise(a);
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
  f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(a.destination); s.start(t); s.stop(t + dur + 0.05);
}
// il "brum brum" del motore
function brum(t0){
  const a = audio(); if (!a) return;
  const t = a.currentTime + (t0 || 0);
  const o = a.createOscillator(), o2 = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
  o.type = 'sawtooth'; o2.type = 'square';
  [[o, 1], [o2, 0.5]].forEach(([x, m]) => {
    x.frequency.setValueAtTime(60 * m, t); x.frequency.linearRampToValueAtTime(150 * m, t + 0.25);
    x.frequency.linearRampToValueAtTime(95 * m, t + 0.45); x.frequency.linearRampToValueAtTime(170 * m, t + 0.75); x.frequency.linearRampToValueAtTime(70 * m, t + 1.1);
  });
  f.type = 'lowpass'; f.frequency.value = 700;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.05); g.gain.setValueAtTime(0.22, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
  o.connect(f); o2.connect(f); f.connect(g).connect(a.destination);
  o.start(t); o2.start(t); o.stop(t + 1.2); o2.stop(t + 1.2);
}
const sfx = {
  brum,
  clacson(){ [0, 0.24].forEach(d => { tone(392, d, 0.18, 'square', 0.07); tone(494, d, 0.18, 'square', 0.07); }); },
  click(){ tone(700, 0, 0.07, 'triangle', 0.12, 900); },
  pop(){ noise(0.15, 2500, 600, 0.6); tone(600, 0, 0.12, 'triangle', 0.12, 1300); },
  ding(){ tone(1046, 0, 0.3, 'triangle', 0.16); tone(1568, 0.08, 0.35, 'sine', 0.1); },
  boing(){ tone(180, 0, 0.35, 'sine', 0.22, 620); tone(360, 0, 0.3, 'triangle', 0.06, 900); },
  yay(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.15)); tone(1047, 0.5, 0.6, 'triangle', 0.13); tone(1319, 0.5, 0.6, 'sine', 0.09); },
  splash(){ noise(0.5, 1800, 300, 0.5); },
  bolle(){ for (let i = 0; i < 8; i++) tone(500 + Math.random() * 900, i * 0.07, 0.09, 'sine', 0.1, 1400 + Math.random() * 800); },
  glu(){ [0, 0.22, 0.44].forEach(d => tone(420, d, 0.16, 'sine', 0.2, 180)); },
  sirena(n){ n = n || 4; for (let i = 0; i < n; i++){ tone(660, i * 0.6, 0.3, 'triangle', 0.1); tone(880, i * 0.6 + 0.3, 0.3, 'triangle', 0.1); } },
  cip(){ tone(2600, 0, 0.08, 'sine', 0.1, 3400); tone(2800, 0.12, 0.08, 'sine', 0.1, 3600); },
  bau(){ [0, 0.28].forEach(d => { tone(320, d, 0.16, 'square', 0.08, 190); noise(0.12, 900, 400, 0.15, d); }); },
  miao(){ tone(520, 0, 0.55, 'triangle', 0.12, 380); tone(700, 0.05, 0.2, 'sine', 0.06, 950); },
  tonk(){ tone(190, 0, 0.25, 'triangle', 0.22, 120); noise(0.1, 1200, 500, 0.3); },
  frenata(){ noise(0.6, 4500, 2500, 0.18); },
  tuono(){ noise(1.4, 400, 60, 0.6); },
  porta(){ noise(0.35, 300, 150, 0.35); tone(140, 0, 0.3, 'triangle', 0.1, 90); },
  whoosh(){ noise(0.5, 400, 3000, 0.25); },
};

document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : (save.sound && ac.resume()); if (document.hidden && window.speechSynthesis) speechSynthesis.cancel(); });

/* voce */
let voice = null;
function findVoice(){
  if (!window.speechSynthesis) return;
  const vs = speechSynthesis.getVoices().filter(v => /^it/i.test(v.lang));
  voice = vs.find(v => /google|alice|federica|elsa/i.test(v.name)) || vs[0] || null;
}
if (window.speechSynthesis){ findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
function say(text, delay){
  if (!save.sound || !window.speechSynthesis) return;
  const go = () => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT'; if (voice) u.voice = voice; u.rate = 0.95; u.pitch = 1.25; u.volume = 1;
      speechSynthesis.speak(u);
    } catch(e){}
  };
  delay ? setTimeout(go, delay) : go();
}

/* ---------------- particelle (coriandoli, bolle, stelline) ---------------- */
const parts = [];
const CONFETTI = ['#ff4d6d', '#ffd23f', '#4dd2ff', '#7cff6b', '#c77dff', '#ff8a1a'];
function burst(x, y, opts){
  opts = opts || {};
  const n = opts.n || 24, sp = opts.speed || 320;
  for (let i = 0; i < n; i++){
    const a = opts.up ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : Math.random() * Math.PI * 2;
    const v = sp * (0.4 + Math.random() * 0.6);
    parts.push({
      x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, g:opts.g == null ? 600 : opts.g,
      life:opts.life || 1.3, t:0, size:(opts.size || 10) * (0.6 + Math.random() * 0.7),
      col:pick(opts.colors || CONFETTI), emoji:opts.emoji ? pick(opts.emoji) : null,
      bubble:!!opts.bubble, rot:Math.random() * 6, vr:(Math.random() - 0.5) * 10,
    });
  }
}
function drawParts(c, dt){
  for (let i = parts.length - 1; i >= 0; i--){
    const p = parts[i];
    p.t += dt; if (p.t > p.life){ parts.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.bubble){ p.vx *= 0.97; p.x += Math.sin(p.t * 6 + p.rot) * 0.8; }
    const k = 1 - p.t / p.life;
    c.save(); c.globalAlpha = Math.min(1, k * 2); c.translate(p.x, p.y);
    if (p.emoji){
      c.rotate(p.rot * 0.2); c.fillStyle = '#000'; c.font = p.size + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.emoji, 0, 0);
    } else if (p.bubble){
      c.beginPath(); c.arc(0, 0, p.size, 0, Math.PI * 2); c.fillStyle = 'rgba(220,245,255,.45)'; c.fill();
      c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke();
      c.beginPath(); c.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.22, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    } else {
      c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    c.restore();
  }
}

/* ---------------- canvas a tutto schermo ---------------- */
function fitCanvas(cv){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, w, h };
}

/* ---------------- pulsante audio + telefono in orizzontale ---------------- */
function setupUI(){
  const sb = document.getElementById('soundBtn');
  if (sb){
    const sync = () => { sb.textContent = save.sound ? '🔊' : '🔇'; };
    sync();
    sb.addEventListener('click', e => {
      e.stopPropagation();
      save.sound = !save.sound; persist(); sync();
      if (!save.sound){ if (window.speechSynthesis) speechSynthesis.cancel(); if (ac) ac.suspend(); }
      else { audio(); sfx.click(); B.onSoundOn && B.onSoundOn(); }
    });
  }
  if (document.body.dataset.landscape !== undefined){
    const r = document.createElement('div');
    r.id = 'rotate'; r.innerHTML = '<div class="phone">📱</div><div>Gira il telefono!</div>';
    document.body.appendChild(r);
    const lock = () => {
      if ((document.fullscreenElement || document.webkitFullscreenElement) && screen.orientation && screen.orientation.lock)
        screen.orientation.lock('landscape').catch(() => {});
    };
    document.addEventListener('fullscreenchange', lock);
    document.addEventListener('webkitfullscreenchange', lock);
  }
  // sblocca l'audio al primo tocco (serve sui telefoni)
  addEventListener('pointerdown', () => audio(), { once:true, capture:true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupUI); else setupUI();

const B = window.Brumme = {
  save, persist, COLORS, BODIES, WHEELS, FACES, colorHex, shade, randomCar, pick,
  rr, drawCar, drawWheel, drawFace, carHeight, INK,
  audio, tone, noise, sfx, say,
  parts, burst, drawParts, fitCanvas, CONFETTI,
};
})();
