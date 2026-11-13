# 🎮 Giochini

I giochi fatti in casa, tutti insieme. Ogni gioco ha la sua cartella.

| Cartella | Gioco | Come si apre |
|---|---|---|
| [`sampei/`](sampei/) | **Lenza d'Oro**: gioco di pesca in 2D e 3D | `sampei/3d.html` oppure `sampei/index.html` |
| [`cavalli/`](cavalli/) | **Agata e Red**: gare di endurance a cavallo, in 3D | `cavalli/index.html` |
| [`ragno/`](ragno/) | **Eroe Ragno**: un supereroe ragno in 3D, per i più piccoli: acchiappa i cattivi, ferma il treno, città libera | `ragno/index.html` |

La pagina [`index.html`](index.html) qui in cima mostra tutti i giochi e porta a ognuno.

## Giocare

Basta aprire `index.html` nel browser. I giochi in 3D caricano Three.js da internet, quindi serve la connessione.

Oppure, da questa cartella:

```bash
python3 -m http.server 8123
```

e poi apri http://localhost:8123

## Aggiungere un gioco

1. Crea una cartella nuova (per esempio `astronavi/`) con dentro il suo `index.html`.
2. Aggiungi la sua scheda in `index.html` e una riga nella tabella qui sopra.
3. Usa nel gioco una chiave di salvataggio tutta sua (`localStorage`), così i progressi non si mescolano con gli altri giochi.

La storia dei commit di ogni gioco è stata conservata quando è stato spostato qui (veniva dai repository `erivello/sampei` ed `erivello/agata`).
