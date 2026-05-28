# Axios Grade Tracker Pro 📊

Un'estensione per Google Chrome (Manifest V3) progettata per eseguire l'estrazione e l'analisi dei voti direttamente dal registro elettronico scolastico italiano **Axios**. Consente di visualizzare statistiche dettagliate, medie calcolate in tempo reale e grafici in una dashboard elegante con design in stile Glassmorphism.

---

## ✨ Funzionalità principale
* **Visualizzazione Dashboard**: Una schermata moderna e sfocata (Glassmorphism) con tema scuro che riassume le performance dello studente.
* **Calcolo Medie Automatico**:
  * **Media Scolastica**: Media aritmetica delle medie di ciascuna materia.
  * **Media Ponderata Reale**: Media complessiva basata su tutti i voti inseriti.
* **Color-Coding a 4 Livelli**:
  * 🔴 **Rosso** (< 5.5) per insufficienze gravi.
  * 🟡 **Giallo** (5.5 - 5.99) per voti vicini alla sufficienza.
  * 🟢 **Verde Chiaro** (6.0 - 6.99) per la sufficienza.
  * 🟢 **Verde Scuro** (≥ 7.0) per voti discreti ed ottimi.
* **Modificatori Intelligenti**: Riconoscimento automatico dei voti decimali (es. `7.85` e `7.75` mostrati come `8-`, `7.25` mostrato come `7+`).
* **Metadati Hover (Tooltip)**: Passando il mouse sopra ciascun voto, un tooltip mostra dettagli utili come la data, il docente, il tipo di prova e le note.
* **Auto-Paginazione**: All'apertura della dashboard l'estensione imposta automaticamente la visualizzazione massima dei voti sul registro per non perdere nessun dato.

---

## 🚀 Come installarla (Gratis)

Dal momento che l'estensione non è pubblicata sul Chrome Web Store ufficiale, puoi installarla gratuitamente seguendo questi passaggi:

1. Clicca sul pulsante verde **Code** in alto a destra in questa pagina e seleziona **Download ZIP**.
2. Estrai il file `.zip` scaricato in una cartella sul tuo computer.
3. Apri Google Chrome e digita **`chrome://extensions`** nella barra degli indirizzi.
4. Attiva la **Modalità sviluppatore** (Developer Mode) tramite l'interruttore in alto a destra.
5. Fai clic sul pulsante **Carica estensione non pacchettizzata** (Load unpacked) in alto a sinistra.
6. Seleziona la cartella estratta (quella contenente il file `manifest.json`).

---

## 📖 Come usarla

1. Accedi al tuo registro elettronico **Axios** (`https://*.axioscloud.it/*`).
2. Naviga nella sezione in cui vengono mostrati i tuoi **voti**.
3. Premi sulla tastiera la combinazione **`Alt + M`** per aprire la dashboard con le statistiche.
4. Per chiudere la dashboard, clicca sul pulsante **✕**, premi **`Esc`** o clicca all'esterno del riquadro.
