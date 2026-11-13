/* =========================================================
   LENZA D'ORO — parte comune a versione 2D e 3D
   Pesci, tecniche, esche, salvataggio, suoni, musica, pannelli.
   È uno script normale (non un modulo), così funziona anche
   aprendo i file direttamente dal disco.
   ========================================================= */
'use strict';

const HERO = 'Tommaso';
const rand = (a,b) => a + Math.random()*(b-a);
const lerp = (a,b,t) => a + (b-a)*t;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* ---------------- TECNICHE DI PESCA ---------------- */
const TECHNIQUES = {
  galleggiante: { name:'Galleggiante', ico:'🎈', cost:0,   firstBait:'pane',
    desc:'Il galleggiante ti dice quando il pesce abbocca: aspetta che vada sotto!' },
  fondo:        { name:'Pesca a fondo', ico:'⚓', cost:60,  firstBait:'lombrico',
    desc:'L\'esca sta sul fondo. Guarda la punta della canna e ascolta il campanello: qui abboccano i pesci grossi!' },
  spinning:     { name:'Spinning', ico:'🥄', cost:100, firstBait:'cucchiaino',
    desc:'Tieni premuto per far nuotare l\'esca verso di te: i predatori la inseguono e attaccano!' },
  mosca:        { name:'Pesca a mosca', ico:'🪰', cost:200, firstBait:'moscaSecca',
    desc:'La mosca galleggia sull\'acqua: quando un pesce sale a prenderla devi essere velocissimo! (non in mare)' },
};
const TEC_KEY = { g:'galleggiante', f:'fondo', s:'spinning', m:'mosca' };
// tempo d'attesa e finestra per ferrare, per tecnica
const TECH_WAIT = { galleggiante:1, fondo:1.5, spinning:1, mosca:.8 };
const TECH_BITE = { galleggiante:1.05, fondo:1.5, spinning:.8, mosca:.7 };

/* ---------------- ESCHE ---------------- */
const BAITS = {
  pane:       { name:'Mollica di pane',  ico:'🍞', tec:['galleggiante'], cost:0,   q:0,
                likes:['cavedano','cefalo','carpa','scardola','alborella','occhiata'], desc:'Semplice: piace ai pesci pacifici.' },
  bigattini:  { name:'Bigattini',        ico:'🐛', tec:['galleggiante'], cost:30,  q:1,
                likes:['trota','temolo','sanguinerola','persico','alborella','occhiata','iridea','lavarello'], desc:'Piccole larve: le adorano i pesci piccoli e le trote.' },
  lombrico:   { name:'Lombrico',         ico:'🪱', tec:['galleggiante','fondo'], cost:40, q:1,
                likes:['trota','tinca','barbo','persico','scazzone','pesce_gatto','anguilla','marmorata'], desc:'Il verme di terra: va bene un po\' per tutto.' },
  mais:       { name:'Mais',             ico:'🌽', tec:['galleggiante','fondo'], cost:50, q:1,
                likes:['carpa','tinca','cavedano','scardola'], desc:'Chicchi dolci per carpe e tinche.' },
  gambero:    { name:'Gamberetto',       ico:'🦐', tec:['galleggiante','fondo'], cost:70, q:2,
                likes:['orata','sarago','spigola','occhiata','pesce_prete','dentice'], desc:'L\'esca preferita dai pesci di mare.' },
  boilies:    { name:'Boiles',           ico:'🟤', tec:['fondo'], cost:90, q:2,
                likes:['carpa','siluro','tinca','barbo'], desc:'Palline profumate per i pesci grossi del fondo.' },
  sarda:      { name:'Pezzo di sarda',   ico:'🐟', tec:['fondo'], cost:80, q:2,
                likes:['dentice','anguilla','pesce_gatto','siluro','pesce_prete','serra'], desc:'Odore fortissimo: attira i predatori che cercano sul fondo.' },
  cucchiaino: { name:'Cucchiaino',       ico:'🥄', tec:['spinning'], cost:0, q:0,
                likes:['trota','persico','iridea','salmerino','sgombro','persico_trota'], desc:'Gira e luccica: i predatori non resistono.' },
  minnow:     { name:'Pesciolino finto', ico:'🐠', tec:['spinning'], cost:120, q:1,
                likes:['luccio','spigola','persico_trota','marmorata','leccia','serra','regina'], desc:'Sembra un pesciolino vero che nuota.' },
  jig:        { name:'Esca metallica',   ico:'🔩', tec:['spinning'], cost:200, q:2,
                likes:['tonno','leccia','dentice','serra','sgombro'], desc:'Pesante e veloce: per i predatori del mare aperto.' },
  moscaSecca: { name:'Mosca secca',      ico:'🪰', tec:['mosca'], cost:0, q:0,
                likes:['temolo','trota','cavedano','scardola','alborella'], desc:'Galleggia come un insetto caduto in acqua.' },
  ninfa:      { name:'Ninfa',            ico:'🦗', tec:['mosca'], cost:100, q:1,
                likes:['temolo','trota','iridea','regina','salmerino','lavarello'], desc:'Imita una larva: piace ai pesci più furbi.' },
};

/* ---------------- LUOGHI E PESCI ----------------
   tec: con quali tecniche si prende (g galleggiante, f fondo, s spinning, m mosca) e quanto spesso */
const PLACES = [
  { id:'torrente', name:'Torrente di montagna', cost:0,
    sky:['#8fd3ff','#d9f1ff'], water:['#3fa7b8','#1d5f73'],
    fish:[
      {id:'cavedano', beh:'calmo', name:'Cavedano', min:.2, max:1.5, w:40, str:2, price:10, col:['#93a2a6','#eef1ee','#c9773a'], pat:'plain', tec:{g:1, f:.5, s:.3, m:1},
       fact:'Il cavedano mangia quasi di tutto: insetti, vermi e perfino le ciliegie che cadono in acqua!'},
      {id:'sanguinerola', beh:'calmo', name:'Sanguinerola', min:.02, max:.1, w:35, str:1, price:60, col:['#6f7a4f','#e9d9b0','#c0392b'], pat:'spots', tec:{g:1.2, m:.6},
       fact:'La sanguinerola è un pesciolino piccolissimo: in primavera i maschi diventano rossi sulla pancia, da cui il nome!'},
      {id:'trota', beh:'scattista', name:'Trota fario', min:.3, max:2.5, w:30, str:4, price:25, col:['#8a7a45','#f1e2b8','#d33b2c'], pat:'spots', dots2:'#2b2b2b', tec:{g:.6, s:1.2, m:1},
       fact:'La trota fario vive in acque fredde e piene di ossigeno. Si riconosce dai puntini rossi e neri sui fianchi.'},
      {id:'iridea', beh:'scattista', name:'Trota iridea', min:.3, max:3, w:22, str:5, price:22, col:['#7d8f6a','#f2e6d8','#d9668a'], pat:'line', tec:{g:.8, s:1, m:.8},
       fact:'La trota iridea ha una striscia rosa e viola sui fianchi, come un arcobaleno. Viene dal Nord America!'},
      {id:'barbo', beh:'testardo', name:'Barbo', min:.5, max:3, w:20, str:5, price:18, col:['#a08c5a','#efe3c0','#7a5f2e'], pat:'plain', barbels:true, tec:{f:1.5, g:.4},
       fact:'Il barbo ha quattro "baffi" sotto la bocca, chiamati barbigli, che usa per cercare il cibo sul fondo.'},
      {id:'scazzone', beh:'calmo', name:'Scazzone', min:.03, max:.15, w:20, str:2, price:50, col:['#6b5a3e','#c9b48a','#3b2e1e'], pat:'spots', tec:{f:1.3},
       fact:'Lo scazzone ha la testa grande e piatta e vive nascosto sotto i sassi. Non ha la vescica natatoria, quindi sta sempre sul fondo.'},
      {id:'temolo', beh:'scattista', name:'Temolo', min:.3, max:1.8, w:9, str:4, price:40, col:['#7b8794','#dfe5ea','#8a3a6a'], pat:'spots', sail:true, tec:{m:1.5, g:.5},
       fact:'Il temolo ha una pinna sul dorso enorme, come una vela. Il suo nome scientifico, Thymallus, viene dal timo: si dice che profumi di quell\'erba!'},
      {id:'salmerino', beh:'furbo', name:'Salmerino alpino', min:.3, max:2, w:8, str:5, price:45, col:['#55636f','#f0a35a','#f5f0e6'], pat:'spots', tec:{s:.8, g:.5, m:.3},
       fact:'Il salmerino alpino vive nelle acque gelide di montagna. In autunno la sua pancia diventa arancione fuoco.'},
      {id:'marmorata', beh:'testardo', name:'Trota marmorata', min:2, max:12, w:5, str:8, price:18, col:['#6f6a4a','#e3dcc0','#3d3a28'], pat:'waves', tec:{s:1, f:.5},
       fact:'La trota marmorata vive solo nei fiumi del Nord Italia e dei paesi vicini. Ha disegni che sembrano marmo e può diventare enorme!'},
      {id:'regina', beh:'scattista', name:'Trota Regina', min:6, max:12, w:1.6, str:9, price:30, col:['#c9a227','#fff1b8','#b0421f'], pat:'spots', legend:true, tec:{s:1, m:1},
       fact:'Leggenda del torrente: una trota grande come un cane, che nessun pescatore è mai riuscito a prendere... fino a oggi!'},
    ]},
  { id:'lago', name:'Lago dei canneti', cost:150,
    sky:['#ffcf8f','#ffeccc'], water:['#4f9a7a','#23523f'],
    fish:[
      {id:'alborella', beh:'calmo', name:'Alborella', min:.01, max:.05, w:35, str:1, price:80, col:['#8fa6b2','#f4f7f8','#5d7380'], pat:'plain', tec:{g:1.5, m:.5},
       fact:'L\'alborella vive in grandi banchi vicino alla superficie e luccica come l\'argento.'},
      {id:'persico', beh:'calmo', name:'Persico reale', min:.2, max:1.5, w:40, str:3, price:15, col:['#8a9a32','#f0e7b0','#3b4a1a'], pat:'stripes', tec:{g:1, s:1},
       fact:'Il persico reale ha strisce scure sui fianchi e una pinna sul dorso con spine appuntite: maneggialo con cura!'},
      {id:'scardola', beh:'calmo', name:'Scardola', min:.1, max:1, w:25, str:2, price:15, col:['#9a8f45','#f1e6b8','#d6452c'], pat:'plain', tall:true, redFins:true, tec:{g:1, m:.8},
       fact:'La scardola si riconosce dalle pinne rosso vivo e dagli occhi dorati.'},
      {id:'tinca', beh:'calmo', name:'Tinca', min:.4, max:2.5, w:30, str:4, price:18, col:['#5d6b2c','#c9b85a','#d07a2a'], pat:'plain', tec:{g:.8, f:1},
       fact:'La tinca ha la pelle scivolosissima e gli occhi rosso-arancio. Ama i fondali fangosi pieni di piante.'},
      {id:'pesce_gatto', beh:'testardo', name:'Pesce gatto', min:.2, max:2, w:22, str:4, price:15, col:['#4a3f33','#c9b89a','#2a231b'], pat:'plain', barbels:true, tec:{f:1.3, g:.3},
       fact:'Il pesce gatto ha otto barbigli intorno alla bocca, proprio come i baffi di un gatto!'},
      {id:'carpa', beh:'testardo', name:'Carpa', min:1, max:12, w:20, str:6, price:8, col:['#a7853e','#f0d68e','#7b5a22'], pat:'scales', barbels:true, tec:{f:1.5, g:.4},
       fact:'La carpa può vivere anche più di 40 anni! Cerca il cibo sul fondo con i suoi barbigli.'},
      {id:'persico_trota', beh:'furbo', name:'Persico trota', min:.3, max:3, w:14, str:6, price:22, col:['#6a8a3a','#eef0c8','#2f3f1c'], pat:'line', tec:{s:1.3},
       fact:'Il persico trota (o black bass) a volte salta fuori dall\'acqua per acchiappare rane e libellule!'},
      {id:'luccio', beh:'furbo', name:'Luccio', min:1, max:10, w:9, str:8, price:14, col:['#4f6b35','#e3e6b8','#d6dc8a'], pat:'spots', long:true, tec:{s:1.5},
       fact:'Il luccio è il re dei predatori d\'acqua dolce: ha centinaia di denti e caccia restando nascosto tra le piante.'},
      {id:'anguilla', beh:'furbo', name:'Anguilla', min:.3, max:3, w:9, str:6, price:25, col:['#4b4a2a','#d8cf9a','#2b2a18'], pat:'plain', eel:true, tec:{f:1.2},
       fact:'L\'anguilla nasce nel Mar dei Sargassi, dall\'altra parte dell\'Oceano Atlantico, e nuota per migliaia di chilometri fino ai nostri laghi!'},
      {id:'lavarello', beh:'scattista', name:'Lavarello', min:.2, max:1.5, w:9, str:4, price:35, col:['#9aa7b0','#f3f5f6','#6e7d88'], pat:'plain', tec:{g:.7, m:.4},
       fact:'Il lavarello vive nei grandi laghi profondi e mangia minuscoli animaletti chiamati plancton.'},
      {id:'siluro', beh:'testardo', name:'Siluro Barbagrigia', min:30, max:80, w:1.6, str:10, price:5, col:['#3e3f3a','#a8a894','#2a2a26'], pat:'plain', barbels:true, long:true, legend:true, tec:{f:1},
       fact:'Si racconta che in fondo al lago viva un siluro vecchissimo, con i baffi lunghi come fruste. I siluri veri possono superare i 2 metri!'},
    ]},
  { id:'mare', name:'Molo sul mare', cost:400,
    sky:['#6ec6ff','#e6f7ff'], water:['#1f7fc4','#0b3b6b'],
    fish:[
      {id:'cefalo', beh:'scattista', name:'Cefalo', min:.3, max:3, w:30, str:4, price:10, col:['#7d8a91','#eef2f3','#4a565d'], pat:'plain', tec:{g:1.5, f:.3},
       fact:'Il cefalo spesso salta fuori dall\'acqua, anche senza motivo. E gli piace tantissimo il pane!'},
      {id:'sgombro', beh:'scattista', name:'Sgombro', min:.2, max:1, w:40, str:3, price:15, col:['#2f7f95','#eef3f5','#14384d'], pat:'waves', tec:{s:1, g:.8},
       fact:'Lo sgombro nuota in banchi enormi, con migliaia di compagni, e non smette quasi mai di muoversi.'},
      {id:'occhiata', beh:'scattista', name:'Occhiata', min:.1, max:.8, w:25, str:3, price:25, col:['#8e9ba3','#eef1f3','#1d2226'], pat:'tailspot', tec:{g:1.2},
       fact:'L\'occhiata ha occhi grandissimi e una macchia nera vicino alla coda, come una sella.'},
      {id:'sarago', beh:'furbo', name:'Sarago', min:.2, max:2, w:25, str:5, price:25, col:['#a9b2b8','#f2f4f5','#2b2f33'], pat:'stripes', tall:true, tec:{f:1, g:.6},
       fact:'Il sarago ha strisce nere verticali e vive tra gli scogli, dove l\'acqua fa la schiuma.'},
      {id:'orata', beh:'furbo', name:'Orata', min:.3, max:3, w:28, str:5, price:30, col:['#9aa8b0','#eef2f4','#e8b923'], pat:'band', tall:true, tec:{f:1.2, g:.4},
       fact:'L\'orata ha una striscia dorata tra gli occhi: è proprio da lì che viene il suo nome!'},
      {id:'spigola', beh:'scattista', name:'Spigola', min:.5, max:5, w:22, str:6, price:28, col:['#7d8a96','#eef1f3','#4a5763'], pat:'plain', tec:{s:1, g:.6, f:.4},
       fact:'Al nord la spigola la chiamano branzino: due nomi diversi, stesso pesce!'},
      {id:'pesce_prete', beh:'testardo', name:'Pesce prete', min:.2, max:1, w:12, str:3, price:30, col:['#7a6a55','#e8dcc4','#f0f0f0'], pat:'spots', tec:{f:1},
       fact:'Il pesce prete ha gli occhi sopra la testa: sta sepolto nella sabbia e guarda sempre il cielo!'},
      {id:'serra', beh:'scattista', name:'Pesce serra', min:1, max:8, w:12, str:7, price:14, col:['#3f6f86','#e9eef0','#1f3a48'], pat:'plain', tec:{s:1.2},
       fact:'Il pesce serra ha denti così affilati che può tagliare la lenza con un morso!'},
      {id:'dentice', beh:'testardo', name:'Dentice', min:1, max:10, w:9, str:8, price:26, col:['#c27f73','#f6dfd6','#3a7fd0'], pat:'spots', tall:true, tec:{f:.8, s:.6},
       fact:'Il dentice ha denti forti e robusti e vive vicino ai fondali rocciosi.'},
      {id:'leccia', beh:'maratoneta', name:'Leccia', min:3, max:20, w:6, str:9, price:8, col:['#6d7f8c','#f2f3f0','#e0b03a'], pat:'line', long:true, tec:{s:1},
       fact:'La leccia caccia velocissima vicino alla superficie e può superare il metro e mezzo di lunghezza!'},
      {id:'tonno', beh:'maratoneta', name:'Tonno rosso', min:80, max:250, w:1.6, str:10, price:3, col:['#1f3b66','#dfe7ee','#f5c518'], pat:'finlets', legend:true, tec:{s:1},
       fact:'Il tonno rosso è un nuotatore velocissimo: attraversa interi mari e può pesare più di un pianoforte!'},
    ]},
];
// trasformo le sigle delle tecniche nei nomi completi
PLACES.forEach(p => p.fish.forEach(f => { const t = {}; Object.entries(f.tec).forEach(([k, v]) => t[TEC_KEY[k]] = v); f.tec = t; }));
const ALL_FISH = PLACES.flatMap(p => p.fish);

const BEHAVIOR = {
  calmo:      { label:'😌 Tranquillo', desc:'Tira poco e si stanca presto.',          moves:{run:2, dive:2, charge:1}, rest:[3.0,4.5], len:1.0 },
  scattista:  { label:'⚡ Scattista',  desc:'Salta fuori dall\'acqua e dà strattoni veloci.', moves:{run:3, jump:2, charge:1}, rest:[1.6,2.8], len:.75 },
  testardo:   { label:'🪨 Testardo',   desc:'Si butta sul fondo e tira a lungo.',     moves:{dive:3, run:2},           rest:[2.4,3.6], len:1.5 },
  furbo:      { label:'🦊 Furbo',      desc:'Cambia direzione e ti viene incontro per liberarsi.', moves:{charge:3, run:2, jump:1}, rest:[1.8,3.0], len:1.0 },
  maratoneta: { label:'🏃 Maratoneta', desc:'Parte con una fuga lunghissima.',        moves:{run:4, dive:1},           rest:[2.2,3.4], len:1.4, firstRun:true },
};
const MOVE_ICON = { run:'⚡', jump:'🐬', charge:'↩️', dive:'⬇️' };

const UPGRADES = {
  rod:  { ico:'🎣', title:'Canna', costs:[0,60,160,350,700],
          names:['Canna di bambù','Canna in fibra','Canna in carbonio','Canna da campione','Canna d\'oro'],
          desc:'Più resistente: la lenza si tende meno quando il pesce tira.' },
  reel: { ico:'🌀', title:'Mulinello', costs:[0,50,140,300,600],
          names:['Mulinello cigolante','Mulinello liscio','Mulinello veloce','Mulinello turbo','Mulinello d\'oro'],
          desc:'Recuperi il filo più in fretta.' },
};

/* ---------------- SALVATAGGIO (condiviso da 2D e 3D) ---------------- */
const SAVE_KEY = 'lenza-doro-v1';
function freshSave(){
  return { coins:0, rod:0, reel:0, bait:0, places:['torrente'], place:'torrente', album:{}, released:0, muted:false, music:true, seenIntro:false, pity:{},
           techs:['galleggiante'], baits:['pane'], tech:'galleggiante', baitSel:{ galleggiante:'pane' } };
}
let save = load();
function load(){
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){}
  s = Object.assign(freshSave(), s || {});
  // la vecchia voce "Esca" del negozio non c'è più: restituisco le monete spese
  if (s.bait > 0){ const old = [0,40,120,260,520]; for (let i=1; i<=s.bait; i++) s.coins += old[i] || 0; s.bait = 0; s.refunded = true; }
  if (!s.techs.includes(s.tech)) s.tech = 'galleggiante';
  return s;
}
function persist(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e){} }
const place = () => PLACES.find(p => p.id === save.place) || PLACES[0];

function techAvailable(placeId, techId){
  const pl = PLACES.find(p => p.id === placeId);
  return pl.fish.some(f => !f.legend && (f.tec[techId] || 0) > 0);
}
function baitsFor(techId){ return Object.keys(BAITS).filter(id => BAITS[id].tec.includes(techId)); }
function curBaitId(){
  const owned = baitsFor(save.tech).filter(id => save.baits.includes(id));
  let id = save.baitSel[save.tech];
  if (!owned.includes(id)) id = owned[0] || TECHNIQUES[save.tech].firstBait;
  return id;
}
function curBait(){ return BAITS[curBaitId()]; }
function baitQ(){ return curBait().q; }

/* ---------------- SCELTA DEL PESCE ----------------
   dipende da luogo, tecnica, esca e lunghezza del lancio */
let forceFish = null;   // solo per i test
function pickFishFor(power){
  if (forceFish){ const f = ALL_FISH.find(z => z.id === forceFish); forceFish = null; if (f) return f; }
  if (!techAvailable(save.place, save.tech)) save.tech = 'galleggiante';   // protezione: tecnica che qui non funziona
  const pl = place(), t = save.tech, bait = curBait(), q = bait.q;
  const can = f => (f.tec[t] || 0) > 0;
  // il leggendario sta al largo e abbocca solo con la tecnica giusta;
  // ogni lancio lungo senza incontrarlo lo rende più probabile
  const leg = pl.fish.find(f => f.legend && can(f));
  if (leg && power >= 0.55){
    const pity = save.pity[pl.id] || 0;
    const chance = (0.02 + pity*0.012 + q*0.01) * (bait.likes.includes(leg.id) ? 1.4 : 1);
    if (Math.random() < chance){ save.pity[pl.id] = 0; persist(); return leg; }
    save.pity[pl.id] = pity + 1; persist();
  }
  const list = pl.fish.filter(f => !f.legend && can(f));
  const ws = list.map(f => {
    let w = f.w * f.tec[t];
    if (bait.likes.includes(f.id)) w *= 3;                              // l'esca giusta conta tanto
    if (f.w < 12) w *= (0.5 + power*1.5) * (1 + q*0.35);                 // i rari amano i lanci lunghi e le esche buone
    return w;
  });
  let r = Math.random() * ws.reduce((a,b) => a+b, 0);
  for (let i=0;i<list.length;i++){ r -= ws[i]; if (r <= 0) return list[i]; }
  return list[0];
}
function rollWeightFor(f, power){
  const big = save.tech === 'fondo' ? .3 : 0;   // a fondo abboccano quelli grossi
  const e = Math.max(1.05, 2.2 - power*0.7 - baitQ()*0.12 - big);
  const v = f.min + (f.max - f.min) * Math.pow(Math.random(), e);
  return v >= 10 ? Math.round(v*10)/10 : v >= .1 ? Math.round(v*100)/100 : Math.round(v*1000)/1000;
}

/* ---------------- AUDIO (sintetizzato) ---------------- */
let AC = null;
function audio(){ if (!AC) { try { AC = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} } if (AC && AC.state==='suspended') AC.resume(); return AC; }
function tone(f, d, type='sine', vol=.15, slide=0, delay=0){
  if (save.muted) return; const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
}
function noise(d=.3, vol=.2, freq=1200){
  if (save.muted) return; const a = audio(); if (!a) return;
  const len = Math.floor(a.sampleRate * d), b = a.createBuffer(1, len, a.sampleRate), ch = b.getChannelData(0);
  for (let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}
const SFX = {
  cast(){ tone(500,.25,'triangle',.08,180); },
  splash(){ noise(.35,.25,900); },
  nibble(){ tone(900,.06,'sine',.06); },
  bite(){ tone(660,.12,'square',.1); tone(990,.15,'square',.1,0,.12); },
  click(){ tone(1300,.03,'square',.025); },
  snap(){ tone(1400,.35,'sawtooth',.12,90); noise(.2,.15,3000); },
  lose(){ tone(400,.25,'triangle',.1,200); tone(300,.35,'triangle',.1,150,.2); },
  win(){ [523,659,784,1046].forEach((f,i)=>tone(f,.25,'triangle',.12,0,i*.11)); },
  coin(){ tone(1200,.08,'square',.06); tone(1600,.12,'square',.06,0,.07); },
  warn(){ tone(220,.08,'square',.05); },
  alert(){ tone(880,.07,'triangle',.08); tone(1175,.09,'triangle',.08,0,.08); },
  whoosh(){ tone(300,.4,'sawtooth',.05,900); },
  omen(){ tone(55,1.2,'sine',.3,40); tone(82,1.2,'triangle',.08,60); },
  drum(){ tone(70,.18,'sine',.28,45); },
  legend(){ [523,659,784,1046,784,1046,1318].forEach((f,i)=>tone(f,.3,'triangle',.13,0,i*.12)); },
  tink(){ tone(2600,.25,'sine',.05); },                                                    // campanello che si muove appena
  bell(){ [0,.14,.28].forEach(d => { tone(2600,.35,'sine',.12,0,d); tone(3900,.2,'sine',.04,0,d); }); },   // campanello che suona forte
  rise(){ noise(.12,.12,2500); },                                                          // un pesce che bolla in superficie
};

/* ---------------- DISEGNO 2D DI UN PESCE (gioco 2D, schede e album) ---------------- */
function fishShape(f){ return f.eel ? .14 : f.tall ? .44 : f.long ? .24 : .32; }
function drawFish(c, x, y, L, f, o={}){
  const dir = o.dir || 1, wig = o.wig || 0;
  const h = L * fishShape(f);
  const sil = !!o.sil;
  const body = sil ? '#13222c' : f.col[0], belly = sil ? '#13222c' : f.col[1], acc = sil ? '#13222c' : f.col[2];
  const fin = sil ? body : f.redFins ? '#d6452c' : body;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(dir, 1); c.globalAlpha = o.alpha ?? 1;
  c.lineJoin = 'round';
  if (f.legend && (!sil || o.glow)){ c.shadowColor = '#ffd84a'; c.shadowBlur = L*.12; }
  const tw = Math.sin(wig) * h * .25;
  // coda
  c.fillStyle = fin;
  c.beginPath(); c.moveTo(-L*.36, 0); c.lineTo(-L*.56, -h*.6 + tw); c.quadraticCurveTo(-L*.47, tw, -L*.56, h*.6 + tw); c.closePath(); c.fill();
  // pinne
  const df = f.sail ? 1.5 : .55;
  c.beginPath(); c.moveTo(-L*.18, -h*.4); c.quadraticCurveTo(-L*.02, -h*(.5 + df), L*.14, -h*.42); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-L*.05, h*.42); c.lineTo(-L*.14, h*.72); c.lineTo(L*.06, h*.45); c.closePath(); c.fill();
  // corpo
  c.fillStyle = body;
  c.beginPath(); c.ellipse(0, 0, L*.42, h*.5, 0, 0, Math.PI*2); c.fill();
  c.shadowBlur = 0;
  if (!sil){
    c.save(); c.clip();
    c.fillStyle = belly; c.beginPath(); c.ellipse(0, h*.34, L*.44, h*.3, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = acc;
    if (f.pat==='spots'){ for (let i=0;i<12;i++){ c.fillStyle = (f.dots2 && i%3===1) ? f.dots2 : acc; c.beginPath(); c.arc(-L*.28 + ((i*37)%60)/60*L*.52, -h*.32 + ((i*53)%40)/40*h*.45, h*.06, 0, Math.PI*2); c.fill(); } }
    if (f.pat==='stripes'){ c.globalAlpha *= .7; for (let i=0;i<6;i++) c.fillRect(-L*.28 + i*L*.1, -h*.5, L*.04, h*.7); }
    if (f.pat==='waves'){ c.strokeStyle = acc; c.lineWidth = Math.max(1, h*.05); for (let i=0;i<6;i++){ const sx = -L*.3 + i*L*.09; c.beginPath(); c.moveTo(sx, -h*.45); c.quadraticCurveTo(sx+L*.04, -h*.25, sx, -h*.08); c.stroke(); } }
    if (f.pat==='band'){ c.fillRect(L*.25, -h*.5, L*.04, h*.55); }
    if (f.pat==='line'){ c.globalAlpha *= .8; c.fillRect(-L*.38, -h*.06, L*.66, h*.13); }
    if (f.pat==='tailspot'){ c.beginPath(); c.arc(-L*.33, -h*.02, h*.2, 0, Math.PI*2); c.fill(); }
    if (f.pat==='scales'){ c.strokeStyle = acc; c.lineWidth = Math.max(1, h*.03); for (let r=0;r<3;r++) for (let i=0;i<6;i++){ c.beginPath(); c.arc(-L*.25 + i*L*.08 + (r%2)*L*.04, -h*.25 + r*h*.2, h*.1, -Math.PI/2, Math.PI/2); c.stroke(); } }
    if (f.pat==='finlets'){ for (let i=0;i<6;i++){ c.beginPath(); c.moveTo(-L*.36 + i*L*.03, -h*.38); c.lineTo(-L*.35 + i*L*.03, -h*.5); c.lineTo(-L*.34 + i*L*.03, -h*.36); c.fill(); } c.fillRect(-L*.3, h*.05, L*.5, h*.05); }
    c.restore();
    // branchia, occhio, bocca
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(1, L*.012);
    c.beginPath(); c.arc(L*.2, 0, h*.35, -Math.PI*.4, Math.PI*.4); c.stroke();
    const eyeY = f.id === 'pesce_prete' ? -h*.35 : -h*.1, eyeR = f.id === 'occhiata' ? h*.17 : h*.12;
    c.fillStyle = f.id === 'scardola' ? '#e8b923' : '#fff'; c.beginPath(); c.arc(L*.3, eyeY, eyeR, 0, Math.PI*2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(L*.31, eyeY, eyeR*.55, 0, Math.PI*2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.moveTo(L*.42, h*.08); c.lineTo(L*.36, h*.12); c.stroke();
    if (f.barbels){ c.strokeStyle = acc; c.lineWidth = Math.max(1, L*.01); c.beginPath(); c.moveTo(L*.4, h*.12); c.quadraticCurveTo(L*.48, h*.4, L*.42, h*(f.legend?.9:.5)); c.moveTo(L*.38, h*.14); c.quadraticCurveTo(L*.4, h*.45, L*.33, h*(f.legend?.85:.55)); c.stroke(); }
  }
  c.restore();
}
function fishCanvas(f, w, h, sil){
  const c = document.createElement('canvas'); const d = Math.min(window.devicePixelRatio||1, 2);
  c.width = w*d; c.height = h*d; const x = c.getContext('2d'); x.scale(d,d);
  drawFish(x, w/2, h/2 + 4, w*.78, f, {sil}); return c;
}

/* =========================================================
   INTERFACCIA: pannelli, negozio, album, tecnica, musica
   Ogni versione del gioco chiama initUI(GAME) passando:
   state(), toIdle(), say(t,d), onOpen(), onPlaceChange(), title
   ========================================================= */
const UI = { open:false };
let GAME = null;

// stili dei pannelli nuovi (tecnica/esche), aggiunti dalla parte comune
(function addStyles(){
  const st = document.createElement('style');
  st.textContent = `
  .hudLeft{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
  #bTech{font-size:clamp(11px,1.7vw,17px)}
  .tgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:6px 0 10px}
  .tcard{border:3px solid var(--ink);border-radius:14px;background:#fff;padding:6px 8px;text-align:center;cursor:pointer;font-size:14px;line-height:1.25;font-family:var(--font);color:var(--ink)}
  .tcard .e{font-size:30px;display:block}
  .tcard b{display:block;font-size:15px}
  .tcard.sel{background:#d8f6e3;box-shadow:0 0 0 3px var(--ok) inset}
  .tcard.locked{opacity:.55}
  .tcard:disabled{cursor:not-allowed}
  .likes{font-size:13px;color:#456}
  .panel h3{margin:10px 0 2px;font-size:clamp(16px,2.4vw,22px)}
  #rotate{position:fixed;inset:0;z-index:50;background:#0f2233;color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;font-family:var(--font);font-weight:800;font-size:24px;padding:24px;gap:12px}
  #rotate .phone{font-size:72px;animation:turn 1.6s ease-in-out infinite}
  @keyframes turn{0%,20%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
  @media (orientation:portrait) and (pointer:coarse){ #rotate{display:flex} }
  /* telefoni in orizzontale: interfaccia più compatta */
  @media (max-height:460px){
    .hb{padding:0 7px;font-size:13px;border-width:2px;border-radius:10px;box-shadow:0 2px 0 var(--ink)}
    .pill{padding:0 10px;font-size:14px;border-width:2px;box-shadow:0 2px 0 var(--ink)}
    #bTech{white-space:nowrap;font-size:12px}
    .btns{gap:4px}
    #msg{font-size:13px;padding:2px 12px}
    .panel{padding:8px 12px}
  }
  `;
  document.head.appendChild(st);
})();

function openPanel(html, closable=true){
  UI.open = true; GAME.onOpen();
  const panel = document.getElementById('panel'), overlay = document.getElementById('overlay');
  panel.innerHTML = (closable ? '<button class="close" id="xClose">✕</button>' : '') + html;
  overlay.classList.add('show');
  if (closable) document.getElementById('xClose').onclick = closePanel;
  panel.scrollTop = 0;
}
function closePanel(){ document.getElementById('overlay').classList.remove('show'); UI.open = false; refreshHud(); }

function techIcons(f){ return Object.keys(f.tec).map(t => TECHNIQUES[t].ico).join(' '); }
function fishName(id){ const f = ALL_FISH.find(z => z.id === id); return f && save.album[id] ? f.name : '???'; }

function showCard(fish, kg){
  const a = save.album[fish.id];
  const isNew = !a, isRecord = a && kg > a.best;
  const value = Math.max(1, Math.round(kg * fish.price));
  const relValue = Math.ceil(value / 2);
  const kgTxt = kg < .1 ? `${Math.round(kg*1000)} grammi` : `${kg.toLocaleString('it-IT')} kg`;
  openPanel(`
    <div class="card">
      <div>${isNew ? '<span class="badge">NUOVO!</span>' : ''}${isRecord ? '<span class="badge red">RECORD!</span>' : ''}${fish.legend ? '<span class="badge">⭐ LEGGENDARIO ⭐</span>' : ''}</div>
      <div id="cardFish"></div>
      <h2>${fish.name}</h2>
      ${fish.legend ? `<p><b>${HERO} ha preso il pesce leggendario!</b></p>` : isNew ? `<p>Nuova specie nell'album di ${HERO}!</p>` : ''}
      <div class="kg">⚖️ ${kgTxt} &nbsp; · &nbsp; 🪙 ${value}</div>
      <p>Carattere: <b>${BEHAVIOR[fish.beh].label}</b> · ${BEHAVIOR[fish.beh].desc}</p>
      <p>Si prende con: ${Object.keys(fish.tec).map(t => TECHNIQUES[t].ico + ' ' + TECHNIQUES[t].name).join(', ')}</p>
      <p class="fact">💡 ${fish.fact}</p>
      <div class="row">
        <button class="big" id="keep">🧺 Tienilo (+${value} 🪙)</button>
        <button class="big alt" id="free">💙 Liberalo (+${relValue} 🪙)</button>
      </div>
    </div>`, false);
  document.getElementById('cardFish').appendChild(fishCanvas(fish, 360, 160));
  const rec = () => { const e = save.album[fish.id] || {n:0, best:0}; e.n++; e.best = Math.max(e.best, kg); save.album[fish.id] = e; };
  document.getElementById('keep').onclick = () => { rec(); save.coins += value; SFX.coin(); persist(); closePanel(); GAME.toIdle(); GAME.say(`+${value} 🪙  Che pescata, ${HERO}!`); };
  document.getElementById('free').onclick = () => { rec(); save.coins += relValue; save.released++; SFX.coin(); persist(); closePanel(); GAME.toIdle(); GAME.say(`💙 Bravo ${HERO}! Il pesce torna a nuotare libero.`); };
}

function showAlbum(){
  let caught = 0;
  let html = '<h2>🐟 Album dei pesci</h2><p class="likes">Le icone dicono con quali tecniche si prende ogni pesce.</p>';
  PLACES.forEach(p => {
    html += `<p><b>${p.name}</b>${save.places.includes(p.id) ? '' : ' 🔒'}</p><div class="grid">`;
    p.fish.forEach(f => {
      const a = save.album[f.id]; if (a) caught++;
      const hint = f.legend && !a ? `<br><i>Si dice che abbocchi solo con: ${Object.keys(f.tec).map(t => TECHNIQUES[t].ico + ' ' + TECHNIQUES[t].name).join(' o ')}</i>` : '';
      html += `<div class="cell ${f.legend?'legend':''}" data-f="${f.id}"><div class="fc"></div><b>${a ? f.name : (f.legend ? '⭐ ???' : '???')}</b>${techIcons(f)}${a ? `<br>${BEHAVIOR[f.beh].label}<br>presi: ${a.n} · record: ${a.best.toLocaleString('it-IT')} kg` : hint}</div>`;
    });
    html += '</div>';
  });
  html += `<p>Specie trovate: <b>${caught} / ${ALL_FISH.length}</b> &nbsp; · &nbsp; Pesci liberati: <b>${save.released}</b> 💙</p>`;
  openPanel(html);
  document.querySelectorAll('#panel .cell').forEach(el => {
    const f = ALL_FISH.find(z => z.id === el.dataset.f);
    el.querySelector('.fc').appendChild(fishCanvas(f, 150, 70, !save.album[f.id]));
  });
}

function showShop(){
  let html = '<h2>🛒 Negozio di pesca</h2><p>Spendi le monete per attrezzatura, tecniche ed esche!</p><h3>🎣 Attrezzatura</h3><div class="shop">';
  Object.entries(UPGRADES).forEach(([k, u]) => {
    const lv = save[k], max = u.costs.length - 1, next = lv < max ? u.costs[lv+1] : null;
    html += `<div class="item"><div class="ico">${u.ico}</div><div class="txt"><b>${u.names[lv]}</b><br>${u.desc}
      <div class="lv">${u.costs.map((_,i)=>`<i class="${i<=lv?'on':''}"></i>`).join('')}</div></div>
      ${next !== null ? `<button class="big" data-k="${k}" ${save.coins < next ? 'disabled' : ''}>${u.names[lv+1]}<br>🪙 ${next}</button>` : '<b>MAX ⭐</b>'}</div>`;
  });
  html += '</div><h3>🎯 Tecniche di pesca</h3><div class="shop">';
  Object.entries(TECHNIQUES).forEach(([id, t]) => {
    const has = save.techs.includes(id);
    html += `<div class="item"><div class="ico">${t.ico}</div><div class="txt"><b>${t.name}</b><br>${t.desc}<br><span class="likes">Con l'esca: ${BAITS[t.firstBait].ico} ${BAITS[t.firstBait].name}</span></div>
      ${has ? '<b>✔️ Ce l\'hai</b>' : `<button class="big" data-t="${id}" ${save.coins < t.cost ? 'disabled' : ''}>Compra<br>🪙 ${t.cost}</button>`}</div>`;
  });
  html += '</div><h3>🪱 Esche</h3><div class="shop">';
  Object.entries(BAITS).forEach(([id, b]) => {
    if (b.cost === 0) return;
    const has = save.baits.includes(id), techOk = b.tec.some(t => save.techs.includes(t));
    const forT = b.tec.map(t => TECHNIQUES[t].ico + ' ' + TECHNIQUES[t].name).join(', ');
    html += `<div class="item"><div class="ico">${b.ico}</div><div class="txt"><b>${b.name}</b><br>${b.desc}<br><span class="likes">Per: ${forT} · Piace a: ${b.likes.map(fishName).join(', ')}</span></div>
      ${has ? '<b>✔️ Ce l\'hai</b>' : !techOk ? '<b>🔒 Prima compra la tecnica</b>' : `<button class="big" data-b="${id}" ${save.coins < b.cost ? 'disabled' : ''}>Compra<br>🪙 ${b.cost}</button>`}</div>`;
  });
  html += '</div>';
  openPanel(html);
  const panel = document.getElementById('panel');
  panel.querySelectorAll('[data-k]').forEach(btn => btn.onclick = () => {
    const k = btn.dataset.k, cost = UPGRADES[k].costs[save[k]+1];
    if (save.coins < cost) return;
    save.coins -= cost; save[k]++; persist(); SFX.win(); showShop(); refreshHud();
  });
  panel.querySelectorAll('[data-t]').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.t, t = TECHNIQUES[id];
    if (save.coins < t.cost) return;
    save.coins -= t.cost; save.techs.push(id);
    if (!save.baits.includes(t.firstBait)) save.baits.push(t.firstBait);
    persist(); SFX.win(); showShop(); refreshHud();
    GAME.say(`Nuova tecnica: ${t.ico} ${t.name}! Sceglila col pulsante in alto a sinistra.`, 3.5);
  });
  panel.querySelectorAll('[data-b]').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.b, b = BAITS[id];
    if (save.coins < b.cost) return;
    save.coins -= b.cost; save.baits.push(id); persist(); SFX.win(); showShop(); refreshHud();
  });
}

function showTech(){
  let html = '<h2>🎣 Come peschiamo?</h2><h3>Tecnica</h3><div class="tgrid">';
  Object.entries(TECHNIQUES).forEach(([id, t]) => {
    const has = save.techs.includes(id), here = techAvailable(save.place, id);
    const note = !has ? `🔒 Nel negozio: 🪙 ${t.cost}` : !here ? '🚫 Non si usa qui' : '';
    html += `<button class="tcard ${save.tech === id ? 'sel' : ''} ${!has || !here ? 'locked' : ''}" data-tech="${id}" ${!has || !here ? 'disabled' : ''}>
      <span class="e">${t.ico}</span><b>${t.name}</b>${note ? `<span class="likes">${note}</span>` : ''}</button>`;
  });
  html += `</div><p class="likes">${TECHNIQUES[save.tech].desc}</p><h3>Esca</h3><div class="tgrid">`;
  const sel = curBaitId();
  baitsFor(save.tech).forEach(id => {
    const b = BAITS[id], has = save.baits.includes(id);
    html += `<button class="tcard ${sel === id ? 'sel' : ''} ${!has ? 'locked' : ''}" data-bait="${id}" ${!has ? 'disabled' : ''}>
      <span class="e">${b.ico}</span><b>${b.name}</b><span class="likes">${has ? 'Piace a: ' + b.likes.map(fishName).join(', ') : `🔒 Nel negozio: 🪙 ${b.cost}`}</span></button>`;
  });
  html += '</div><div class="row"><button class="big" id="techOk">Andiamo a pescare! 🎣</button></div>';
  openPanel(html);
  const panel = document.getElementById('panel');
  panel.querySelectorAll('[data-tech]').forEach(btn => btn.onclick = () => { save.tech = btn.dataset.tech; persist(); showTech(); });
  panel.querySelectorAll('[data-bait]').forEach(btn => btn.onclick = () => { save.baitSel[save.tech] = btn.dataset.bait; persist(); showTech(); });
  document.getElementById('techOk').onclick = closePanel;
}

function showPlaces(){
  let html = '<h2>🗺️ Dove andiamo a pescare?</h2><div class="places">';
  PLACES.forEach(p => {
    const has = save.places.includes(p.id), here = save.place === p.id;
    html += `<div class="place"><div class="sky" style="background:linear-gradient(${p.sky[0]},${p.sky[1]} 55%,${p.water[0]} 56%,${p.water[1]})"></div>
      <b>${p.name}</b><span class="likes">${p.fish.length} specie</span><br>
      ${here ? '<button class="big alt" disabled>Sei qui</button>'
        : has ? `<button class="big" data-go="${p.id}">Vai!</button>`
        : `<button class="big" data-buy="${p.id}" ${save.coins < p.cost ? 'disabled' : ''}>🔓 Sblocca 🪙 ${p.cost}</button>`}</div>`;
  });
  html += '</div>';
  openPanel(html);
  const go = id => {
    save.place = id;
    if (!techAvailable(id, save.tech)){ GAME.say(`Qui ${TECHNIQUES[save.tech].ico} ${TECHNIQUES[save.tech].name} non si può usare: torniamo al 🎈 galleggiante.`, 3.5); save.tech = 'galleggiante'; }
    persist(); GAME.onPlaceChange(); closePanel();
  };
  const panel = document.getElementById('panel');
  panel.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { go(b.dataset.go); GAME.say(`Benvenuto: ${place().name}!`); });
  panel.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    const p = PLACES.find(z => z.id === b.dataset.buy);
    if (save.coins < p.cost) return;
    save.coins -= p.cost; save.places.push(p.id); SFX.win(); go(p.id); GAME.say(`Nuovo luogo sbloccato: ${p.name}! 🎉`, 3);
  });
}

function showReset(){
  const caught = Object.keys(save.album).length;
  openPanel(`
    <h2>🔄 Ricominciare da zero?</h2>
    <p>Se ricominci perdi <b>tutto</b>:</p>
    <p>🪙 ${save.coins} monete &nbsp;·&nbsp; 🐟 ${caught} specie nell'album &nbsp;·&nbsp; 🎣 attrezzatura, tecniche ed esche &nbsp;·&nbsp; 🗺️ luoghi sbloccati</p>
    <p><b>Non si può tornare indietro.</b></p>
    <div class="row">
      <button class="big alt" id="resetNo">No, torna al gioco</button>
      <button class="big" id="resetYes" style="background:#ff7b6b">Sì, ricomincia</button>
    </div>`);
  document.getElementById('resetNo').onclick = closePanel;
  document.getElementById('resetYes').onclick = () => {
    const keep = { muted: save.muted, music: save.music };   // le preferenze di musica e suoni restano
    Object.keys(save).forEach(k => delete save[k]);
    Object.assign(save, freshSave(), keep);
    persist();
    closePanel(); GAME.toIdle(); GAME.onPlaceChange();
    showIntro();
  };
}

function showIntro(){
  openPanel(`
    <h2>🎣 ${GAME.title}</h2>
    <p>Ciao <b>${HERO}</b>! Sei un giovane pescatore. Il tuo sogno? Diventare il più grande pescatore del mondo e catturare i <b>pesci leggendari</b>!</p>
    <div class="steps">
      <div class="step"><div class="e">👆</div><b>1. Lancia</b><br>Tieni premuto e lascia quando la barra è piena. Più lontano lanci, più trovi pesci rari!</div>
      <div class="step"><div class="e">👀</div><b>2. Aspetta</b><br>Quando il pesce abbocca e compare il <b>!</b>, clicca subito!</div>
      <div class="step"><div class="e">🌀</div><b>3. Recupera</b><br>Tieni premuto per tirare. Se la tensione va nel <b style="color:#e74c3c">rosso</b>, <b>molla</b> o si rompe il filo!</div>
    </div>
    <p><b>Le mosse dei pesci</b>: prima di ogni mossa compare un'icona.<br>
      ⚡ <b>scappa</b> → molla &nbsp;·&nbsp; 🐬 <b>salta</b> → molla &nbsp;·&nbsp; ↩️ <b>ti viene incontro</b> → recupera veloce &nbsp;·&nbsp; ⬇️ <b>va sul fondo</b> → tieni con calma</p>
    <p><b>Tecniche ed esche</b>: nel negozio trovi la pesca a fondo, lo spinning col cucchiaino e la pesca a mosca. Ogni esca piace a pesci diversi!</p>
    <div class="row"><button class="big" id="go">Iniziamo! 🐟</button></div>`, false);
  document.getElementById('go').onclick = () => { save.seenIntro = true; persist(); audio(); closePanel(); };
}

/* ---------------- HUD ---------------- */
let hudBtns = [];
function refreshHud(){
  document.getElementById('coins').textContent = '🪙 ' + save.coins;
  document.getElementById('bSound').textContent = save.muted ? '🔇' : '🔊';
  const b = curBait(), t = TECHNIQUES[save.tech];
  document.getElementById('bTech').textContent = `${t.ico} ${t.name} · ${b.ico} ${b.name}`;
}
let lastTechLabel = '';
function hudTick(state){
  hudBtns.forEach(b => b.disabled = state !== 'idle');
  document.getElementById('coins').textContent = '🪙 ' + save.coins;
  const b = curBait(), t = TECHNIQUES[save.tech], label = `${t.ico} ${t.name} · ${b.ico} ${b.name}`;
  if (label !== lastTechLabel){ document.getElementById('bTech').textContent = label; lastTechLabel = label; }
}

/* ---------------- MUSICA DI SOTTOFONDO ----------------
   Due musiche:
   - a casa (file aperto dal disco, localhost, rete di casa 192.168.x / 10.x):
     la sigla, assets/sigla.mp3, che NON è nel repository (è solo sul computer);
   - online (GitHub Pages): "La canzone di Tommaso", una musica originale
     suonata dal gioco stesso, nota per nota.
   Se la sigla non c'è, si sente comunque quella originale.
   Per provarle a mano: aggiungi ?musica=nuova oppure ?musica=sigla all'indirizzo. */
const MUSIC_VOL = .18, FADE = 1.6;   // volume della sigla (0..1) e durata della dissolvenza in secondi
const IS_HOME = (() => {
  if (location.protocol === 'file:') return true;
  const h = location.hostname;
  return h === '' || h === 'localhost' || h === '::1' || h === '[::1]' || /\.local$/.test(h) ||
    /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
})();
const MUSIC_PICK = new URLSearchParams(location.search).get('musica');
let musicMode = MUSIC_PICK === 'nuova' ? 'synth' : MUSIC_PICK === 'sigla' || IS_HOME ? 'mp3' : 'synth';
let musicStarted = false;

/* ---- la sigla (mp3): due copie che si incrociano con una dissolvenza ---- */
let tracks = [], curTrack = 0, musicTimer = null, routed = false;
// su iPhone/iPad il volume si può cambiare solo passando dal mixer audio del browser
function routeMusic(){
  if (routed || location.protocol === 'file:') return;
  const ctx = audio(); if (!ctx) return;
  try {
    tracks.forEach(t => { const src = ctx.createMediaElementSource(t.a); t.g = ctx.createGain(); t.g.gain.value = 0; src.connect(t.g).connect(ctx.destination); });
    routed = true;
  } catch(e){}
}
function setVol(t, v){ v = Math.max(0, Math.min(1, v)); if (t.g) t.g.gain.value = v; else t.a.volume = v; }
function envelope(t){ const d = t.a.duration, x = t.a.currentTime; if (!d) return 0; return MUSIC_VOL * Math.min(1, x / FADE, (d - x) / FADE); }
function musicTick(){
  const A = tracks[curTrack], B = tracks[1 - curTrack];
  setVol(A, envelope(A));
  if (!B.a.paused) setVol(B, envelope(B));   // quella che sta sfumando via
  const d = A.a.duration;
  if (d && d - A.a.currentTime <= FADE && B.a.paused){   // sta per finire: parte l'altra copia da capo
    B.a.currentTime = 0; setVol(B, 0); B.a.play().catch(() => {}); curTrack = 1 - curTrack;
  }
}
function mp3Play(on){
  if (on){
    routeMusic();
    const A = tracks[curTrack];
    if (A.a.paused){ setVol(A, envelope(A)); A.a.play().catch(() => {}); }
    if (!musicTimer) musicTimer = setInterval(musicTick, 50);
  } else {
    tracks.forEach(t => t.a.pause());
    clearInterval(musicTimer); musicTimer = null;
  }
}
function setupSigla(){
  tracks = [0, 1].map(() => { const a = new Audio('assets/sigla.mp3'); a.preload = 'auto'; return { a, g:null }; });
  // la sigla non c'è (per esempio su una copia scaricata da GitHub): si passa alla musica originale
  tracks[0].a.addEventListener('error', () => {
    if (musicMode !== 'mp3') return;
    mp3Play(false); musicMode = 'synth'; syncMusic();
  });
}

/* ---- "La canzone di Tommaso": musica originale, allegra, da avventura in barca ----
   In Sol maggiore, 132 battiti al minuto. Ogni battuta dura 8 crome.
   Note: "G4" = una croma, "G4:2" = due crome, "r" = pausa. */
const SONG_BPM = 132, SONG_VOL = .35;   // volume simile a quello della sigla
const SONG_A1 = [
  ['G',  'r D4 G4 A4 B4:2 G4:2'],
  ['G',  'D5:3 B4 A4:2 G4:2'],
  ['C',  'E5:2 E5 D5 C5:2 E5:2'],
  ['G',  'D5:6 r:2'],
  ['Em', 'B4 B4 B4 C5 D5:2 B4:2'],
  ['C',  'C5 C5 C5 B4 A4:2 G4:2'],
  ['D',  'A4:2 D5:2 F#5:2 E5 D5'],
  ['D',  'A4:6 r:2'],
];
const SONG_A2 = [
  ...SONG_A1.slice(0, 3),
  ['G',  'D5:2 B4 G4 D5:4'],
  ...SONG_A1.slice(4, 6),
  ['D',  'A4 B4 C5 D5 E5:2 F#5:2'],
  ['G',  'G5:6 r:2'],
];
const SONG_B = [
  ['C',  'E5:3 D5 C5:2 G4:2'],
  ['D',  'F#5:3 E5 D5:2 A4:2'],
  ['Bm', 'D5 D5 D5 E5 F#5:2 D5:2'],
  ['Em', 'G5:4 E5:2 B4:2'],
  ['C',  'C5 D5 E5 G5 E5:2 C5:2'],
  ['D',  'D5 E5 F#5 A5 F#5:2 D5:2'],
  ['G',  'B5:2 A5 G5 D5:2 B4:2'],
  ['D7', 'C5:2 B4 A4 F#4:2 D4:2'],
];
const SONG = [...SONG_A1, ...SONG_A2, ...SONG_B, ...SONG_A2];
// accordo: [basso sul primo tempo, basso sul terzo, note del "pa" sul secondo e quarto]
const SONG_CHORDS = {
  G:  ['G2', 'D3', ['B3','D4','G4']],
  C:  ['C3', 'G2', ['C4','E4','G4']],
  D:  ['D3', 'A2', ['A3','D4','F#4']],
  D7: ['D3', 'A2', ['A3','C4','F#4']],
  Em: ['E2', 'B2', ['B3','E4','G4']],
  Bm: ['B2', 'F#2',['B3','D4','F#4']],
};
function midiOf(n){
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  return 12 * (+m[3] + 1) + {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
// tutta la canzone diventa una lista di eventi, croma per croma
const SONG_STEPS = (() => {
  const steps = [];
  SONG.forEach(([ch, mel]) => {
    const base = steps.length;
    for (let i = 0; i < 8; i++) steps.push([]);
    const [b1, b3, stab] = SONG_CHORDS[ch];
    steps[base].push({ k:'bass', m:midiOf(b1), d:2 });
    steps[base + 4].push({ k:'bass', m:midiOf(b3), d:2 });
    [2, 6].forEach(s => stab.forEach(n => steps[base + s].push({ k:'stab', m:midiOf(n), d:1 })));
    [0, 4].forEach(s => steps[base + s].push({ k:'kick' }));
    [2, 6].forEach(s => steps[base + s].push({ k:'snare' }));
    for (let s = 1; s < 8; s += 2) steps[base + s].push({ k:'hat' });
    let pos = 0;
    mel.split(' ').forEach(tok => {
      const [n, len] = tok.split(':'), d = +(len || 1);
      if (n !== 'r') steps[base + pos].push({ k:'lead', m:midiOf(n), d });
      pos += d;
    });
    if (pos !== 8) console.warn('battuta sbagliata', ch, mel);
  });
  return steps;
})();

let song = null;   // { bus, leadF, noiseBuf, step, next, timer }
function songVoice(t, freq, dur, type, vol, dest){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + .012);
  g.gain.setTargetAtTime(vol * .55, t + .03, .12);
  g.gain.setTargetAtTime(0, t + dur * .88, .035);
  o.connect(g).connect(dest);
  o.start(t); o.stop(t + dur + .3);
}
function songNoise(t, dur, vol, type, freq){
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = song.noiseBuf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(f).connect(g).connect(song.bus);
  s.start(t, Math.random() * .5); s.stop(t + dur + .02);
}
function songPlayStep(evs, t, e8){
  evs.forEach(ev => {
    const dur = ev.d * e8;
    if (ev.k === 'lead'){
      songVoice(t, hz(ev.m), dur, 'square', .07, song.leadF);
      songVoice(t, hz(ev.m - 12), dur, 'triangle', .06, song.bus);
    } else if (ev.k === 'bass'){
      songVoice(t, hz(ev.m), dur * .9, 'triangle', .2, song.bus);
    } else if (ev.k === 'stab'){
      songVoice(t, hz(ev.m), dur * .6, 'square', .022, song.leadF);
    } else if (ev.k === 'kick'){
      const o = AC.createOscillator(), g = AC.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.001, t + .16);
      o.connect(g).connect(song.bus); o.start(t); o.stop(t + .2);
    } else if (ev.k === 'snare'){
      songNoise(t, .12, .06, 'bandpass', 1800);
    } else if (ev.k === 'hat'){
      songNoise(t, .035, .025, 'highpass', 7000);
    }
  });
}
function songTick(){
  const e8 = 30 / SONG_BPM;   // durata di una croma in secondi
  while (song.next < AC.currentTime + .2){
    songPlayStep(SONG_STEPS[song.step], song.next, e8);
    song.next += e8;
    song.step = (song.step + 1) % SONG_STEPS.length;
  }
}
function synthPlay(on){
  if (on){
    const ctx = audio(); if (!ctx) return;
    if (!song){
      const bus = ctx.createGain(); bus.gain.value = 0; bus.connect(ctx.destination);
      const leadF = ctx.createBiquadFilter(); leadF.type = 'lowpass'; leadF.frequency.value = 2400; leadF.connect(bus);
      const len = ctx.sampleRate, noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate), ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      song = { bus, leadF, noiseBuf, step:0, next:0, timer:null };
    }
    if (song.timer) return;
    song.bus.gain.cancelScheduledValues(ctx.currentTime);
    song.bus.gain.setTargetAtTime(SONG_VOL, ctx.currentTime, .4);   // entra piano piano
    song.next = ctx.currentTime + .1;
    song.timer = setInterval(songTick, 40);
    songTick();
  } else if (song && song.timer){
    clearInterval(song.timer); song.timer = null;
    song.bus.gain.cancelScheduledValues(AC.currentTime);
    song.bus.gain.setTargetAtTime(0, AC.currentTime, .08);
  }
}

function syncMusic(){
  document.getElementById('bMusic').classList.toggle('off', !save.music);
  const on = save.music && musicStarted && !document.hidden;
  if (musicMode === 'mp3'){ synthPlay(false); mp3Play(on); }
  else { if (tracks.length) mp3Play(false); synthPlay(on); }
}
window.__music = { mode: () => musicMode, home: IS_HOME, tracks: () => tracks, song: () => song };   // per i test dal browser

/* ---------------- SCHERMO INTERO E ORIZZONTALE (telefoni) ----------------
   Su Android il gioco va a tutto schermo e si gira in orizzontale.
   Su iPhone il browser non lo permette: si usa l'icona sulla schermata Home. */
const canFull = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const isTouch = matchMedia('(pointer:coarse)').matches;
function isFull(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function enterFull(){
  const el = document.documentElement;
  const req = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen();
  Promise.resolve(req).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
}
function exitFull(){ if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); }
function setupFullscreen(){
  const btn = document.getElementById('bFull');
  if (!canFull){ btn.style.display = 'none'; }
  else btn.onclick = () => isFull() ? exitFull() : enterFull();
  const sync = () => { btn.textContent = isFull() ? '🗗' : '⛶'; };
  document.addEventListener('fullscreenchange', sync); document.addEventListener('webkitfullscreenchange', sync);
  // avviso per girare il telefono (si vede solo in verticale sui telefoni)
  const rot = document.createElement('div'); rot.id = 'rotate';
  rot.innerHTML = '<div class="phone">📱</div><div>Gira il telefono in orizzontale</div>' + (canFull ? '<button class="big" id="rotFull">⛶ Gioca a tutto schermo</button>' : '');
  document.body.appendChild(rot);
  if (canFull) document.getElementById('rotFull').onclick = enterFull;
  // sui telefoni Android: al primo tocco va da solo a tutto schermo
  if (isTouch && canFull){
    const once = () => { window.removeEventListener('pointerup', once, true); if (!isFull()) enterFull(); };
    window.addEventListener('pointerup', once, true);
  }
}

/* ---------------- AVVIO ---------------- */
function initUI(game){
  GAME = game;
  document.getElementById('overlay').addEventListener('pointerdown', e => { if (e.target.id === 'overlay' && GAME.state() !== 'caught' && save.seenIntro) closePanel(); });
  hudBtns = ['bAlbum','bShop','bPlaces','bTech','bReset'].map(id => document.getElementById(id));
  const guard = fn => () => { if (GAME.state() !== 'idle'){ GAME.say('Finisci prima di pescare questo pesce! 🎣'); return; } fn(); };
  document.getElementById('bAlbum').onclick = guard(showAlbum);
  document.getElementById('bShop').onclick = guard(showShop);
  document.getElementById('bPlaces').onclick = guard(showPlaces);
  document.getElementById('bTech').onclick = guard(showTech);
  document.getElementById('bReset').onclick = guard(showReset);
  document.getElementById('bSound').onclick = () => { save.muted = !save.muted; persist(); refreshHud(); };
  document.querySelector('.hud').addEventListener('pointerdown', e => e.stopPropagation());
  // musica
  if (musicMode === 'mp3') setupSigla();
  const firstTouch = () => { if (musicStarted) return; musicStarted = true; syncMusic(); };
  window.addEventListener('pointerdown', firstTouch, true);
  window.addEventListener('keydown', firstTouch, true);
  document.addEventListener('visibilitychange', syncMusic);   // si ferma se cambi scheda
  document.getElementById('bMusic').onclick = () => { save.music = !save.music; persist(); musicStarted = true; syncMusic(); };
  syncMusic();
  setupFullscreen();
  refreshHud();
  if (!save.seenIntro) showIntro();
  else if (save.refunded){ delete save.refunded; persist(); GAME.say('🪙 Il negozio è cambiato: ti ho restituito le monete delle vecchie esche. Ora ci sono tecniche ed esche nuove!', 5); }
}
