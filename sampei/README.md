# 🎣 Lenza d'Oro

Un gioco di pesca nel browser, fatto in casa.

## Come si gioca

1. **Lancia**: tieni premuto (mouse, dito o barra spaziatrice) e lascia andare. Più lontano lanci, più trovi pesci rari.
2. **Aspetta**: quando il galleggiante va sotto e compare il **!**, clicca subito.
3. **Recupera**: tieni premuto per tirare il filo. Quando il pesce si dibatte e la tensione va nel rosso, **molla**, altrimenti la lenza si spezza.

Prima di ogni mossa del pesce compare un'icona: ⚡ scappa (molla), 🐬 salta (molla), ↩️ ti viene incontro (recupera veloce), ⬇️ va sul fondo (tieni con calma). Ogni specie ha un carattere: tranquillo, scattista, testardo, furbo o maratoneta.

Con le monete compri canne, mulinelli ed esche migliori e sblocchi nuovi luoghi (lago e mare). In ogni luogo vive un **pesce leggendario**: sta al largo, si annuncia con un'ombra enorme e a metà lotta si arrabbia. Più lanci lunghi fai, più è probabile incontrarlo.

## Versione 3D

`3d.html` è lo stesso gioco in 3D (Three.js, stile low-poly): Tommaso pesca dal masso, dal pontile o dal molo, i pesci nuotano sott'acqua e saltano fuori. Regole, pesci e salvataggio sono condivisi con la versione 2D, e i pulsanti **2D / 3D** passano da una all'altra. Serve una connessione internet perché Three.js viene caricato da CDN.

## Avviarlo

È un solo file: basta aprire `index.html` nel browser.

Oppure, da questa cartella:

```bash
python3 -m http.server 8123
```

e poi apri http://localhost:8123 (2D) oppure http://localhost:8123/3d.html (3D)

I progressi si salvano nel browser (localStorage).
