# 🎣 Lenza d'Oro

Un gioco di pesca nel browser, fatto in casa.

## Come si gioca

1. **Lancia**: tieni premuto (mouse, dito o barra spaziatrice) e lascia andare. Più lontano lanci, più trovi pesci rari.
2. **Aspetta**: quando il galleggiante va sotto e compare il **!**, clicca subito.
3. **Recupera**: tieni premuto per tirare il filo. Quando il pesce si dibatte e la tensione va nel rosso, **molla**, altrimenti la lenza si spezza.

Prima di ogni mossa del pesce compare un'icona: ⚡ scappa (molla), 🐬 salta (molla), ↩️ ti viene incontro (recupera veloce), ⬇️ va sul fondo (tieni con calma). Ogni specie ha un carattere: tranquillo, scattista, testardo, furbo o maratoneta.

## Tecniche ed esche

Il pulsante in alto a sinistra sceglie tecnica ed esca. Le tecniche nuove e le esche si comprano nel negozio.

- 🎈 **Galleggiante**: aspetti che il galleggiante vada sotto.
- ⚓ **Pesca a fondo**: il piombo sta sul fondo; quando la punta della canna trema forte e suona il campanello, ferri. Abboccano i pesci più grossi.
- 🥄 **Spinning**: tieni premuto per far nuotare l'esca verso di te; i predatori la inseguono e attaccano.
- 🪰 **Pesca a mosca**: la mosca galleggia, quando un pesce la prende devi essere velocissimo (non in mare).

Ogni esca piace a pesci diversi. Ci sono 32 specie fra torrente, lago e mare, e ogni pesce si prende solo con alcune tecniche (l'album lo mostra con le icone).

Con le monete compri anche canne e mulinelli migliori e sblocchi nuovi luoghi. In ogni luogo vive un **pesce leggendario**: sta al largo, abbocca solo con la tecnica giusta, si annuncia con un'ombra enorme e a metà lotta si arrabbia.

## Versione 3D

`3d.html` è lo stesso gioco in 3D (Three.js, stile low-poly): Tommaso pesca dal masso, dal pontile o dal molo, i pesci nuotano sott'acqua e saltano fuori. Regole, pesci e salvataggio sono condivisi con la versione 2D (tutto quello che è comune sta in `gioco-comune.js`), e i pulsanti **2D / 3D** passano da una all'altra. Serve una connessione internet perché Three.js viene caricato da CDN.

## Avviarlo

Basta aprire `index.html` (o `3d.html`) nel browser. I file `gioco-comune.js` e la cartella `assets/` devono restare accanto.

Oppure, da questa cartella:

```bash
python3 -m http.server 8123
```

e poi apri http://localhost:8123 (2D) oppure http://localhost:8123/3d.html (3D)

I progressi si salvano nel browser (localStorage).
