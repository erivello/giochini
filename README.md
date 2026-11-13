# 🎮 Giochini

I giochi fatti in casa, tutti insieme. Ogni gioco ha la sua cartella.

| Cartella | Gioco | Come si apre |
|---|---|---|
| [`il-pescatore/`](il-pescatore/) | **Lenza d'Oro**: gioco di pesca in 2D e 3D | `il-pescatore/3d.html` oppure `il-pescatore/index.html` |
| [`cavalli/`](cavalli/) | **Agata e Red**: gare di endurance a cavallo, in 3D | `cavalli/index.html` |
| [`uomo-ragno/`](uomo-ragno/) | **Eroe Ragno**: un supereroe ragno in 3D, per i più piccoli: acchiappa i cattivi, ferma il treno, città libera | `uomo-ragno/index.html` |
| [`brumme/`](brumme/) | **Brummè**: le macchinine per i più piccoli (2 anni): garage, strada, paese e prato in 3D | `brumme/index.html` |

La pagina [`index.html`](index.html) qui in cima mostra tutti i giochi e porta a ognuno.

## Giocare

Basta aprire `index.html` nel browser. I giochi in 3D caricano Three.js da internet, quindi serve la connessione.

Oppure, da questa cartella:

```bash
python3 -m http.server 8123
```

e poi apri http://localhost:8123

### La musica di Lenza d'Oro

A casa (file aperto dal disco, `localhost` o un indirizzo della rete di casa come `192.168.…`) suona la sigla, `il-pescatore/assets/sigla.mp3`. Il file non è nel repository per i diritti d'autore: va copiato a mano in quella cartella. Online, o se il file manca, suona "La canzone di Tommaso", una musica originale che il gioco suona da solo. Per sentirle a mano aggiungi `?musica=nuova` oppure `?musica=sigla` all'indirizzo.

## Installare come app

Online i giochi sono su https://erivello.github.io/giochini/ e si possono installare come app: su Android con il pulsante "📲 Installa come app" nella pagina iniziale (oppure menu ⋮ → Installa app), su iPhone con Condividi → Aggiungi alla schermata Home. Dopo la prima apertura funzionano anche senza internet.

Servono `manifest.webmanifest` (nome, colori, icone in `icone/`), `sw.js` (il service worker che salva i file sul telefono) e `app.js` (lo attiva, solo online).

## Aggiungere un gioco

1. Crea una cartella nuova (per esempio `astronavi/`) con dentro il suo `index.html`.
2. Aggiungi la sua scheda in `index.html` e una riga nella tabella qui sopra.
3. Usa nel gioco una chiave di salvataggio tutta sua (`localStorage`), così i progressi non si mescolano con gli altri giochi.
4. Per il telefono, includi in fondo alla pagina `<script src="../schermo-intero.js" data-after="idDelPulsanteAudio"></script>`: aggiunge il pulsante ⛶ accanto a quello indicato e, su Android, va a tutto schermo al primo tocco. Nel `<head>` metti anche i tag `apple-mobile-web-app-capable` e `mobile-web-app-capable`, per aprire il gioco a tutto schermo dall'icona sulla schermata Home (vedi `cavalli/index.html`).
5. Nel `<head>` aggiungi i collegamenti all'app, come negli altri giochi: `manifest.webmanifest`, le icone e `<script src="../app.js" defer></script>`. Poi aggiungi i file del gioco alla lista `FILES` in `sw.js` e cambia `VERSIONE`, così funziona anche offline.

La storia dei commit di ogni gioco è stata conservata quando è stato spostato qui (veniva dai repository `erivello/sampei` ed `erivello/agata`).
