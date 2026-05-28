/* ============================================================
   Axios Grade Tracker Pro — content.js
   Architettura: ES6 Class (AxiosGradeTracker)
   Attivazione: Alt + M
   ============================================================ */

'use strict';

(function () {

  // ─── Guardia anti-doppia-iniezione ────────────────────────────────────────
  if (window.__axProTrackerLoaded) return;
  window.__axProTrackerLoaded = true;

  /* ==========================================================================
     class AxiosGradeTracker
     Incapsula tutta la logica dell'estensione senza inquinare lo scope globale.
     ========================================================================== */
  class AxiosGradeTracker {

    // ── Costanti di configurazione ──────────────────────────────────────────
    static MIN_GRADE = 2;
    static MAX_GRADE = 10;
    static PAGINATION_WAIT_MS = 1200;

    // ── Dizionario di normalizzazione acronimi Axios ─────────────────────────
    static SUBJECT_DICT = {
      // Italiano / Lingue
      'lin_lett_ita'          : 'Italiano',
      'lett_ita'              : 'Italiano',
      'italiano'              : 'Italiano',
      'ita'                   : 'Italiano',
      'it'                    : 'Italiano',
      'italiano e storia'     : 'Italiano e Storia',
      'ita_sto'               : 'Italiano e Storia',
      'lingua italiana'       : 'Italiano',

      // Matematica
      'mat e compl'           : 'Matematica',
      'mat e complementi'     : 'Matematica',
      'matematica'            : 'Matematica',
      'mat'                   : 'Matematica',
      'math'                  : 'Matematica',
      'matematica e complementi': 'Matematica e Complementi',
      'mat_compl'             : 'Matematica e Complementi',

      // Scienze
      'sci'                   : 'Scienze',
      'scienze'               : 'Scienze',
      'scienze nat'           : 'Scienze Naturali',
      'scienze naturali'      : 'Scienze Naturali',
      'scienze int'           : 'Scienze Integrate',
      'scienze integrate'     : 'Scienze Integrate',
      'biologia'              : 'Biologia',
      'chimica'               : 'Chimica',
      'fisica'                : 'Fisica',
      'fis'                   : 'Fisica',

      // Storia / Geog / Ed. Civica
      'storia'                : 'Storia',
      'sto'                   : 'Storia',
      'storia e geografia'    : 'Storia e Geografia',
      'geo'                   : 'Geografia',
      'geografia'             : 'Geografia',
      'ed. civica'            : 'Ed. Civica',
      'educazione civica'     : 'Ed. Civica',
      'ed_civ'                : 'Ed. Civica',

      // Lingue straniere
      'inglese'               : 'Inglese',
      'ing'                   : 'Inglese',
      'lin_ing'               : 'Inglese',
      'lin_fra'               : 'Francese',
      'francese'              : 'Francese',
      'fra'                   : 'Francese',
      'lin_ted'               : 'Tedesco',
      'tedesco'               : 'Tedesco',
      'spagnolo'              : 'Spagnolo',
      'lin_spa'               : 'Spagnolo',

      // Tecnologia / Informatica
      'tec'                   : 'Tecnologia',
      'tecnologia'            : 'Tecnologia',
      'informatica'           : 'Informatica',
      'inf'                   : 'Informatica',
      'lab_inf'               : 'Lab. Informatica',
      'sistemi e reti'        : 'Sistemi e Reti',
      'sis_ret'               : 'Sistemi e Reti',
      'gest_pro'              : 'Gestione Progetto',
      'gestione del progetto' : 'Gestione Progetto',

      // Arte / Musica / Ed. Fisica
      'arte'                  : 'Arte e Immagine',
      'arte e immagine'       : 'Arte e Immagine',
      'art'                   : 'Arte e Immagine',
      'musica'                : 'Musica',
      'mus'                   : 'Musica',
      'ed. fisica'            : 'Ed. Fisica',
      'educazione fisica'     : 'Ed. Fisica',
      'ed_fis'                : 'Ed. Fisica',
      'scienze motorie'       : 'Scienze Motorie',

      // Tecnico / Professionale
      'diritto'               : 'Diritto',
      'dir'                   : 'Diritto',
      'economia'              : 'Economia',
      'eco'                   : 'Economia',
      'ragioneria'            : 'Ragioneria',
      'tpsit'                 : 'TPSIT',
      'telecomunicazioni'     : 'Telecomunicazioni',
      'lab_elet'              : 'Lab. Elettronica',
      'lab_ele'               : 'Lab. Elettronica',
      'elettronica'           : 'Elettronica',
      'elettrotecnica'        : 'Elettrotecnica',
      'meccanica'             : 'Meccanica',
      'disegno tecnico'       : 'Disegno Tecnico',
      'dis_tec'               : 'Disegno Tecnico',

      // Religione / Alternativa
      'religione'             : 'Religione',
      'rel'                   : 'Religione',
      'att_alt'               : 'Attività Alternative',
      'attività alternative'  : 'Attività Alternative',
    };

    // ── Costruttore ──────────────────────────────────────────────────────────
    constructor() {
      this._overlayEl  = null;
      this._tooltipEl  = null;
      this._triggerBtnEl = null;
      this._monitoringTimer = null;
      this._boundKeyHandler = this._onKeyDown.bind(this);
      this._init();
    }

    // ── Inizializzazione listener tastiera e monitoraggio ────────────────────
    _init() {
      document.addEventListener('keydown', this._boundKeyHandler);
      console.info('[AxiosGradeTracker] Pronto. Premi Alt+M o usa il pulsante in pagina per aprire la dashboard.');
      this._startTableMonitoring();
    }

    // ── Monitoraggio della presenza della tabella voti ───────────────────────
    _startTableMonitoring() {
      // Controlla ogni 1.5 secondi se la tabella dei voti è presente nel DOM
      this._monitoringTimer = setInterval(() => {
        const table = this._findGradeTable();
        if (table) {
          this._injectTriggerButton();
        } else {
          this._removeTriggerButton();
        }
      }, 1500);
    }

    // ── Cerca la barra del footer di Axios nel DOM ───────────────────────────
    _findFooterElement() {
      // Cerca in tutti i tag comuni per contenitori di testo di footer
      const tags = ['footer', 'div', 'p', 'span'];
      for (const tag of tags) {
        const elements = document.querySelectorAll(tag);
        for (const el of elements) {
          const text = el.textContent || '';
          if (text.includes('Axios Italia') && (text.includes('Registro Elettronico') || text.includes('©'))) {
            // Assicuriamoci che non sia un elemento contenitore troppo ampio (es. body, html o tabelle intere)
            if (el.children.length <= 15 && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
              return el;
            }
          }
        }
      }
      return null;
    }

    // ── Iniezione del pulsante "Apri Dashboard" ──────────────────────────────
    _injectTriggerButton() {
      if (document.getElementById('ax-pro-trigger-btn')) return; // già presente

      const btn = document.createElement('button');
      btn.id = 'ax-pro-trigger-btn';
      btn.className = 'ax-pro-trigger-btn';
      btn.innerHTML = '<span>📊</span> Apri Dashboard';
      btn.title = 'Visualizza statistiche avanzate e medie (Alt+M)';
      btn.setAttribute('aria-label', 'Apri dashboard statistiche voti');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._launch();
      });

      const footer = this._findFooterElement();
      if (footer) {
        // Imposta position relative per permettere il posizionamento assoluto del pulsante
        const computedStyle = window.getComputedStyle(footer);
        if (computedStyle.position === 'static') {
          footer.style.position = 'relative';
        }
        btn.classList.add('ax-pro-trigger-btn--footer');
        footer.appendChild(btn);
        console.info('[AxiosGradeTracker] Pulsante inserito nella barra del footer.');
      } else {
        btn.classList.add('ax-pro-trigger-btn--fixed');
        document.body.appendChild(btn);
        console.info('[AxiosGradeTracker] Barra del footer non trovata, pulsante inserito come elemento fluttuante.');
      }

      this._triggerBtnEl = btn;
    }

    // ── Rimozione del pulsante ────────────────────────────────────────────────
    _removeTriggerButton() {
      const btn = document.getElementById('ax-pro-trigger-btn');
      if (btn) {
        btn.parentNode.removeChild(btn);
        this._triggerBtnEl = null;
      }
    }

    // ── Punto d'ingresso principale ──────────────────────────────────────────
    _launch() {
      if (this._overlayEl) return; // già aperta
      this._showLoader();
      this._handlePagination();
    }

    // ── Gestione paginazione ─────────────────────────────────────────────────
    _handlePagination() {
      const select = this._findPaginationSelect();

      if (!select) {
        console.warn('[AxiosGradeTracker] Select paginazione non trovata — estraggo con la visibilità attuale.');
        this._extractAndRender();
        return;
      }

      // Trova il valore massimo disponibile nell'elenco opzioni
      let maxValue  = null;
      let maxOption = null;

      for (const opt of select.options) {
        const num = parseInt(opt.value, 10);
        if (!isNaN(num)) {
          if (maxValue === null || num > maxValue) {
            maxValue  = num;
            maxOption = opt;
          }
        }
      }

      // Se non è già impostato al massimo, cambio programmaticamente
      if (maxOption && select.value !== maxOption.value) {
        console.info(`[AxiosGradeTracker] Imposto paginazione a ${maxOption.value} elementi per pagina.`);
        select.value = maxOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        // Attendo che la pagina ricarichi le righe
        setTimeout(() => this._extractAndRender(), AxiosGradeTracker.PAGINATION_WAIT_MS);
      } else {
        // Già al massimo, estraggo subito
        this._extractAndRender();
      }
    }

    // ── Cerca la select di paginazione nel DOM ────────────────────────────────
    _findPaginationSelect() {
      // Pattern Axios: <select> con opzioni numeriche vicino a testi tipo "Visualizza" / "per pagina"
      const selects = document.querySelectorAll('select');
      for (const sel of selects) {
        const hasNumericOptions = Array.from(sel.options).some(o => /^\d+$/.test(o.value.trim()));
        if (!hasNumericOptions) continue;

        // Controlla il testo nel contesto del genitore
        const parentText = (sel.parentElement?.textContent || '').toLowerCase();
        if (
          parentText.includes('visualizza') ||
          parentText.includes('per pagina') ||
          parentText.includes('elementi') ||
          sel.getAttribute('aria-label')?.toLowerCase().includes('per pagina')
        ) {
          return sel;
        }
      }

      // Fallback: cerca per nome/id comuni usati da Axios
      return (
        document.querySelector('select[name*="length"]')   ||
        document.querySelector('select[name*="pageSize"]') ||
        document.querySelector('select.dataTables_length select') ||
        document.querySelector('.dataTables_length select')
      );
    }

    // ── Estrazione dati e rendering ───────────────────────────────────────────
    _extractAndRender() {
      try {
        const table = this._findGradeTable();
        if (!table) {
          this._showError('Tabella voti non trovata.<br>Assicurati di essere sulla pagina dei voti di Axios.');
          return;
        }

        const gradesMap = this._parseTable(table);

        if (Object.keys(gradesMap).length === 0) {
          this._showError('Nessun voto valido trovato nella pagina.<br>La pagina potrebbe non essere ancora caricata completamente.');
          return;
        }

        const stats = this._computeStats(gradesMap);
        this._renderDashboard(gradesMap, stats);

      } catch (err) {
        console.error('[AxiosGradeTracker] Errore durante l\'estrazione:', err);
        this._showError(`Errore imprevisto: ${err.message}`);
      }
    }

    // ── Identifica la tabella corretta dei voti (solo nella sezione Voti Elenco) ──
    _findGradeTable() {
      const tables = document.querySelectorAll('table');

      for (const table of tables) {
        // Controlla le intestazioni (th) della tabella
        const headers = Array.from(table.querySelectorAll('th, thead td')).map(
          el => el.textContent.trim().toLowerCase()
        );

        const hasMateriaHeader = headers.some(h => h.includes('materia') || h.includes('disciplina'));
        const hasValutazioneHeader = headers.some(h =>
          h.includes('valutazione') || h.includes('voto') || h.includes('voti')
        );
        const hasDataHeader = headers.some(h => h.includes('data'));
        const hasDocenteHeader = headers.some(h =>
          h.includes('docente') || h.includes('professore') || h.includes('insegnante') || h.includes('prof')
        );

        // La tabella dei voti in elenco contiene tutti questi elementi distintivi
        if (hasMateriaHeader && hasValutazioneHeader && hasDataHeader && hasDocenteHeader) {
          console.info('[AxiosGradeTracker] Tabella voti identificata:', table);
          return table;
        }
      }

      return null;
    }

    // ── Parsing della tabella e costruzione della mappa voti ─────────────────
    _parseTable(table) {
      const gradesMap = {}; // { nomeMateria: [{ value, raw, date, teacher, type, note }, ...] }

      // Determina gli indici di colonna da usare
      const headers = Array.from(table.querySelectorAll('th, thead td')).map(
        el => el.textContent.trim().toLowerCase()
      );

      const materiaIdx     = this._findColIndex(headers, ['materia', 'disciplina', 'materie']);
      const valutazioneIdx = this._findColIndex(headers, ['valutazione', 'voto', 'voti']);
      const dataIdx        = this._findColIndex(headers, ['data']);
      const docenteIdx     = this._findColIndex(headers, ['docente', 'professore', 'insegnante', 'prof']);
      const tipoIdx        = this._findColIndex(headers, ['tipo', 'tipologia', 'periodo', 'quadrimestre', 'trimestre']);
      const noteIdx        = this._findColIndex(headers, ['note', 'descrizione', 'giudizio', 'annotazione', 'commento']);

      console.info('[AxiosGradeTracker] Colonne rilevate →',
        { materia: materiaIdx, voto: valutazioneIdx, data: dataIdx, docente: docenteIdx, tipo: tipoIdx, note: noteIdx }
      );

      if (materiaIdx === -1) {
        console.warn('[AxiosGradeTracker] Colonna "Materia" non trovata nelle intestazioni:', headers);
      }

      // Itera sulle righe del corpo
      const rows = table.querySelectorAll('tbody tr');

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) {
          console.warn(`[AxiosGradeTracker] Riga ${rowIndex} ignorata: meno di 2 celle.`);
          return;
        }

        const getCell = (idx, fallback = -1) =>
          (idx !== -1 ? cells[idx] : fallback !== -1 ? cells[fallback] : null)
            ?.textContent?.trim() || '';

        // Estrai testo materia e valutazione
        const rawSubject = getCell(materiaIdx, 0);
        const rawGrade   = getCell(valutazioneIdx, 1);

        if (!rawSubject || !rawGrade) {
          console.warn(`[AxiosGradeTracker] Riga ${rowIndex} ignorata: celle vuote. Subject="${rawSubject}" Grade="${rawGrade}"`);
          return;
        }

        // Normalizza il nome della materia
        const subjectName = this._normalizeSubject(rawSubject);

        // Parsa il voto
        const gradeValue = this._parseGrade(rawGrade);

        if (gradeValue === null) {
          console.warn(`[AxiosGradeTracker] Riga ${rowIndex} ignorata: voto non valido. Raw="${rawGrade}"`);
          return;
        }

        // Metadati aggiuntivi
        const gradeObj = {
          value   : gradeValue,
          raw     : rawGrade,
          date    : this._formatDate(getCell(dataIdx)),
          teacher : this._formatName(getCell(docenteIdx)),
          type    : getCell(tipoIdx),
          note    : getCell(noteIdx),
        };

        // Aggiungi alla mappa
        if (!gradesMap[subjectName]) {
          gradesMap[subjectName] = [];
        }
        gradesMap[subjectName].push(gradeObj);
      });

      return gradesMap;
    }

    // ── Formatta data in formato leggibile ────────────────────────────────────
    _formatDate(raw) {
      if (!raw) return '';
      // Prova a parsare date comuni: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
      const clean = raw.trim();
      const patterns = [
        { re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, fn: (m) => `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[3]}` },
        { re: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, fn: (m) => `${m[3].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[1]}` },
      ];
      for (const { re, fn } of patterns) {
        const m = clean.match(re);
        if (m) return fn(m);
      }
      return clean; // restituisce così com'è se non riconosciuto
    }

    // ── Formatta nome docente (Cognome Nome → Cognome N.) ─────────────────────
    _formatName(raw) {
      if (!raw) return '';
      const parts = raw.trim().split(/\s+/);
      if (parts.length <= 1) return raw.trim();
      // Se sembra "COGNOME NOME", abbrevia il nome
      return parts[0] + ' ' + parts.slice(1).map(p => p[0]?.toUpperCase() + '.').join(' ');
    }

    // ── Trovare l'indice di colonna dal nome ──────────────────────────────────
    _findColIndex(headers, keywords) {
      for (let i = 0; i < headers.length; i++) {
        if (keywords.some(kw => headers[i].includes(kw))) return i;
      }
      return -1;
    }

    // ── Normalizzazione nome materia ──────────────────────────────────────────
    _normalizeSubject(raw) {
      // Pulisci caratteri invisibili e spazi multipli
      const cleaned = raw
        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ') // non-breaking & zero-width spaces
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      // Cerca nel dizionario (exact match)
      if (AxiosGradeTracker.SUBJECT_DICT[cleaned]) {
        return AxiosGradeTracker.SUBJECT_DICT[cleaned];
      }

      // Cerca match parziale (la chiave è contenuta nel testo o viceversa)
      for (const [key, value] of Object.entries(AxiosGradeTracker.SUBJECT_DICT)) {
        if (cleaned.includes(key) || key.includes(cleaned)) {
          return value;
        }
      }

      // Fallback: titolizza il testo originale
      return raw.trim().replace(/\b\w/g, c => c.toUpperCase());
    }

    // ── Parsing avanzato del voto ─────────────────────────────────────────────
    _parseGrade(rawStr) {
      if (!rawStr || typeof rawStr !== 'string') return null;

      // Pulisci caratteri invisibili e spazi
      let str = rawStr
        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, '')
        .replace(/\s+/g, '')
        .trim();

      if (!str) return null;

      // Rileva e rimuovi modificatori PRIMA del numero
      let modifier = 0;

      // ½ → +0.5  (può comparire come ½, 1/2, o carattere unicode)
      const hasHalf = /½|1\/2/.test(str);
      if (hasHalf) {
        modifier += 0.5;
        str = str.replace(/½|1\/2/g, '');
      }

      // + → +0.25 (suffisso dopo il numero)
      const hasPlus = str.endsWith('+');
      if (hasPlus) {
        modifier += 0.25;
        str = str.replace(/\+$/, '');
      }

      // - → -0.15 (suffisso dopo il numero — solo quando NON è un meno iniziale, es. 8- = 7.85)
      const hasMinus = str.endsWith('-') && !str.startsWith('-');
      if (hasMinus) {
        modifier -= 0.15;
        str = str.replace(/-$/, '');
      }

      // Sostituisci virgola con punto (formato italiano)
      str = str.replace(',', '.');

      // Rimuovi tutto ciò che non è cifra o punto decimale
      str = str.replace(/[^0-9.]/g, '');

      if (!str) return null;

      const value = parseFloat(str) + modifier;

      // Validazione range: un voto Axios è compreso tra 2 e 10
      if (
        isNaN(value) ||
        value < AxiosGradeTracker.MIN_GRADE ||
        value > AxiosGradeTracker.MAX_GRADE
      ) {
        return null;
      }

      return Math.round(value * 100) / 100; // arrotonda a 2 decimali
    }

    // ── Motore statistico ─────────────────────────────────────────────────────
    _computeStats(gradesMap) {
      const subjects = Object.keys(gradesMap);
      if (subjects.length === 0) return null;

      let sumOfSubjectAverages = 0;
      let sumAllGrades         = 0;
      let totalGrades          = 0;
      let suffCount            = 0;
      let insufCount           = 0;

      const subjectStats = {};

      for (const subj of subjects) {
        const gradeObjs = gradesMap[subj];
        // usa .value da ogni oggetto voto
        const values  = gradeObjs.map(g => g.value);
        const subjSum = values.reduce((a, b) => a + b, 0);
        const subjAvg = subjSum / values.length;
        const rounded = Math.round(subjAvg * 100) / 100;

        subjectStats[subj] = {
          avg   : rounded,
          grades: gradeObjs,   // oggetti completi con metadati
          count : gradeObjs.length,
        };

        sumOfSubjectAverages += rounded;
        sumAllGrades         += subjSum;
        totalGrades          += gradeObjs.length;

        if (rounded >= 6) suffCount++;
        else              insufCount++;
      }

      const schoolAvg   = Math.round((sumOfSubjectAverages / subjects.length) * 100) / 100;
      const weightedAvg = Math.round((sumAllGrades / totalGrades) * 100) / 100;

      return {
        schoolAvg,
        weightedAvg,
        totalGrades,
        totalSubjects : subjects.length,
        suffCount,
        insufCount,
        subjectStats,
      };
    }

    // ── Formattazione personalizzata dei voti decimali (es. 7.85 -> 8-, 7.75 -> 8-, 7.25 -> 7+)
    _formatGradeDisplay(value) {
      const decimal = value % 1;
      const integer = Math.floor(value);
      if (Math.abs(decimal - 0.85) < 0.01 || Math.abs(decimal - 0.75) < 0.01) {
        return `${integer + 1}-`;
      }
      if (Math.abs(decimal - 0.25) < 0.01) {
        return `${integer}+`;
      }
      return value % 1 === 0 ? value.toFixed(0) : value.toString();
    }

    // ── Classifica un voto → classe CSS color-coding ──────────────────────────
    _gradeClass(avg) {
      if (avg >= 7)   return 'ax-pro--suf-dark';
      if (avg >= 6)   return 'ax-pro--suf';
      if (avg >= 5.5) return 'ax-pro--warn';
      return 'ax-pro--ins';
    }

    _statClass(avg) {
      if (avg >= 7)   return 'ax-pro-stat--suf-dark';
      if (avg >= 6)   return 'ax-pro-stat--suf';
      if (avg >= 5.5) return 'ax-pro-stat--warn';
      return 'ax-pro-stat--ins';
    }

    // ── Rendering della dashboard ─────────────────────────────────────────────
    _renderDashboard(gradesMap, stats) {
      // Rimuovi il loader
      this._clearOverlay();

      // Genera HTML cards per ogni materia
      const cardsHTML = Object.entries(stats.subjectStats)
        .sort((a, b) => b[1].avg - a[1].avg)
        .map(([subj, data]) => {
          const cls       = this._gradeClass(data.avg);
          const progress  = ((data.avg - 2) / 8) * 100;
          const avgDisplay = data.avg % 1 === 0 ? data.avg.toFixed(0) : data.avg;

          // Ogni pill trasporta i metadati del voto come data-attributes
          const pillsHTML = data.grades.map(g => {
            const display = this._formatGradeDisplay(g.value);
            const attrs   = [
              g.raw     ? `data-raw="${this._esc(g.raw)}"`         : '',
              g.date    ? `data-date="${this._esc(g.date)}"`       : '',
              g.teacher ? `data-teacher="${this._esc(g.teacher)}"` : '',
              g.type    ? `data-type="${this._esc(g.type)}"`       : '',
              g.note    ? `data-note="${this._esc(g.note)}"`       : '',
            ].filter(Boolean).join(' ');
            return `<span class="ax-pro-pill ax-pro-pill--tip" ${attrs}>${display}</span>`;
          }).join('');

          return `
            <div class="ax-pro-subject-card ${cls}">
              <span class="ax-pro-count">${data.count} vot${data.count === 1 ? 'o' : 'i'}</span>
              <div class="ax-pro-subject-name">${subj}</div>
              <div class="ax-pro-subject-avg">${avgDisplay}</div>
              <div class="ax-pro-pills">${pillsHTML}</div>
              <div class="ax-pro-progress-wrap">
                <div class="ax-pro-progress-bar" style="width: ${Math.min(progress, 100).toFixed(1)}%"></div>
              </div>
            </div>`;
        })
        .join('');

      // Genera statistiche riepilogative
      const schoolAvgClass   = this._statClass(stats.schoolAvg);
      const weightedAvgClass = this._statClass(stats.weightedAvg);

      const summaryHTML = `
        <div class="ax-pro-stat-card ${schoolAvgClass}">
          <div class="ax-pro-stat-value">${stats.schoolAvg % 1 === 0 ? stats.schoolAvg.toFixed(0) : stats.schoolAvg}</div>
          <div class="ax-pro-stat-label">Media Scolastica</div>
        </div>
        <div class="ax-pro-stat-card ${weightedAvgClass}">
          <div class="ax-pro-stat-value">${stats.weightedAvg % 1 === 0 ? stats.weightedAvg.toFixed(0) : stats.weightedAvg}</div>
          <div class="ax-pro-stat-label">Media Ponderata</div>
        </div>
        <div class="ax-pro-stat-card ax-pro-stat--neu">
          <div class="ax-pro-stat-value">${stats.totalGrades}</div>
          <div class="ax-pro-stat-label">Voti Totali</div>
        </div>
        <div class="ax-pro-stat-card ax-pro-stat--suf">
          <div class="ax-pro-stat-value">${stats.suffCount}</div>
          <div class="ax-pro-stat-label">Materie Suf.</div>
        </div>
        <div class="ax-pro-stat-card ax-pro-stat--ins">
          <div class="ax-pro-stat-value">${stats.insufCount}</div>
          <div class="ax-pro-stat-label">Materie Insuf.</div>
        </div>`;

      const modalHTML = `
        <div id="ax-pro-overlay">
          <div id="ax-pro-modal" role="dialog" aria-modal="true" aria-label="Dashboard Voti Axios">

            <div class="ax-pro-header">
              <div class="ax-pro-title">
                <div class="ax-pro-logo-badge">📊</div>
                <div class="ax-pro-title-text">
                  <span class="ax-pro-title-main">Axios Grades</span>
                  <span class="ax-pro-title-sub">DASHBOARD</span>
                </div>
              </div>
              <button class="ax-pro-close-btn" id="ax-pro-close-btn" title="Chiudi (Esc)" aria-label="Chiudi dashboard">✕</button>
            </div>

            <div class="ax-pro-section-title">📈 Riepilogo Statistico</div>
            <div class="ax-pro-summary">${summaryHTML}</div>

            <div class="ax-pro-section-title">📚 Voti per Materia</div>
            <div class="ax-pro-grid">${cardsHTML}</div>

            <div class="ax-pro-footer">
              <span class="ax-pro-footer-hint">💡 Premi <strong>Esc</strong> o clicca fuori per chiudere • <strong>Alt+M</strong> per riaprire</span>
              <span class="ax-pro-badge">Axios Grade Tracker Pro v1.0</span>
            </div>

          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this._overlayEl = document.getElementById('ax-pro-overlay');

      this._attachCloseEvents();
      this._initTooltip();
    }

    // ── Escape HTML per attributi ─────────────────────────────────────────────
    _esc(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // ── Tooltip engine ────────────────────────────────────────────────────────
    _initTooltip() {
      // Crea l'elemento tooltip una sola volta nel body
      if (!document.getElementById('ax-pro-tooltip')) {
        const el = document.createElement('div');
        el.id = 'ax-pro-tooltip';
        el.setAttribute('role', 'tooltip');
        document.body.appendChild(el);
      }
      this._tooltipEl = document.getElementById('ax-pro-tooltip');

      // Usa event delegation sull'overlay per efficienza
      this._overlayEl.addEventListener('mouseover', (e) => {
        const pill = e.target.closest('.ax-pro-pill--tip');
        if (pill) this._showTooltip(pill, e);
      });

      this._overlayEl.addEventListener('mousemove', (e) => {
        const pill = e.target.closest('.ax-pro-pill--tip');
        if (pill) this._positionTooltip(e);
      });

      this._overlayEl.addEventListener('mouseout', (e) => {
        const pill = e.target.closest('.ax-pro-pill--tip');
        if (pill) this._hideTooltip();
      });
    }

    _showTooltip(pill, e) {
      const raw     = pill.dataset.raw     || '';
      const date    = pill.dataset.date    || '';
      const teacher = pill.dataset.teacher || '';
      const type    = pill.dataset.type    || '';
      const note    = pill.dataset.note    || '';

      // Costruisci il contenuto solo con i campi disponibili
      const rows = [];
      if (raw)     rows.push(`<div class="ax-pro-tt-row"><span class="ax-pro-tt-icon">🎯</span><span class="ax-pro-tt-label">Voto</span><span class="ax-pro-tt-val">${this._esc(raw)}</span></div>`);
      if (date)    rows.push(`<div class="ax-pro-tt-row"><span class="ax-pro-tt-icon">📅</span><span class="ax-pro-tt-label">Data</span><span class="ax-pro-tt-val">${this._esc(date)}</span></div>`);
      if (teacher) rows.push(`<div class="ax-pro-tt-row"><span class="ax-pro-tt-icon">👨‍🏫</span><span class="ax-pro-tt-label">Docente</span><span class="ax-pro-tt-val">${this._esc(teacher)}</span></div>`);
      if (type)    rows.push(`<div class="ax-pro-tt-row"><span class="ax-pro-tt-icon">📝</span><span class="ax-pro-tt-label">Tipo</span><span class="ax-pro-tt-val">${this._esc(type)}</span></div>`);
      if (note)    rows.push(`<div class="ax-pro-tt-row ax-pro-tt-note"><span class="ax-pro-tt-icon">💬</span><span class="ax-pro-tt-label">Nota</span><span class="ax-pro-tt-val">${this._esc(note)}</span></div>`);

      if (rows.length === 0) return; // nessun metadato disponibile, non mostrare

      this._tooltipEl.innerHTML = rows.join('');
      this._tooltipEl.classList.add('ax-pro-tt--visible');
      this._positionTooltip(e);
    }

    _positionTooltip(e) {
      if (!this._tooltipEl) return;
      const tt   = this._tooltipEl;
      const pad  = 14;
      const vpW  = window.innerWidth;
      const vpH  = window.innerHeight;
      const ttW  = tt.offsetWidth  || 240;
      const ttH  = tt.offsetHeight || 120;

      let x = e.clientX + pad;
      let y = e.clientY + pad;

      // Evita di uscire a destra
      if (x + ttW > vpW - pad) x = e.clientX - ttW - pad;
      // Evita di uscire in basso
      if (y + ttH > vpH - pad) y = e.clientY - ttH - pad;

      tt.style.left = `${Math.max(pad, x)}px`;
      tt.style.top  = `${Math.max(pad, y)}px`;
    }

    _hideTooltip() {
      if (this._tooltipEl) {
        this._tooltipEl.classList.remove('ax-pro-tt--visible');
      }
    }

    // ── Mostra loader ─────────────────────────────────────────────────────────
    _showLoader() {
      this._clearOverlay();

      const html = `
        <div id="ax-pro-overlay">
          <div id="ax-pro-modal">
            <div class="ax-pro-header">
              <div class="ax-pro-title">
                <div class="ax-pro-logo-badge">📊</div>
                <div class="ax-pro-title-text">
                  <span class="ax-pro-title-main">Axios Grades</span>
                  <span class="ax-pro-title-sub">DASHBOARD</span>
                </div>
              </div>
              <button class="ax-pro-close-btn" id="ax-pro-close-btn" title="Chiudi (Esc)">✕</button>
            </div>
            <div class="ax-pro-loader">
              <div class="ax-pro-spinner"></div>
              <span>Estrazione voti in corso…</span>
            </div>
          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', html);
      this._overlayEl = document.getElementById('ax-pro-overlay');
      this._attachCloseEvents();
    }

    // ── Mostra errore ─────────────────────────────────────────────────────────
    _showError(message) {
      this._clearOverlay();

      const html = `
        <div id="ax-pro-overlay">
          <div id="ax-pro-modal">
            <div class="ax-pro-header">
              <div class="ax-pro-title">
                <div class="ax-pro-logo-badge">📊</div>
                <div class="ax-pro-title-text">
                  <span class="ax-pro-title-main">Axios Grades</span>
                  <span class="ax-pro-title-sub">DASHBOARD</span>
                </div>
              </div>
              <button class="ax-pro-close-btn" id="ax-pro-close-btn" title="Chiudi (Esc)">✕</button>
            </div>
            <div class="ax-pro-error-box">
              <div class="ax-pro-error-icon">⚠️</div>
              <strong>Impossibile estrarre i voti</strong>
              <p>${message}</p>
            </div>
          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', html);
      this._overlayEl = document.getElementById('ax-pro-overlay');
      this._attachCloseEvents();
    }

    // ── Chiusura modale con animazione ────────────────────────────────────────
    _closeModal() {
      if (!this._overlayEl) return;

      this._overlayEl.classList.add('ax-pro-closing');

      // Aspetta il completamento dell'animazione prima di rimuovere
      const overlay = this._overlayEl;
      this._overlayEl = null;

      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 250);
    }

    // ── Rimuove immediatamente l'overlay ─────────────────────────────────────
    _clearOverlay() {
      this._hideTooltip();
      const existing = document.getElementById('ax-pro-overlay');
      if (existing) existing.parentNode.removeChild(existing);
      this._overlayEl = null;
    }

    // ── Attacca eventi di chiusura ────────────────────────────────────────────
    _attachCloseEvents() {
      // Pulsante ✕
      const closeBtn = document.getElementById('ax-pro-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this._closeModal());
      }

      // Click sullo sfondo (overlay) — non sul modal interno
      if (this._overlayEl) {
        this._overlayEl.addEventListener('click', (e) => {
          if (e.target === this._overlayEl) {
            this._closeModal();
          }
        });
      }

      // Tasto Escape (gestito nel listener globale già esistente)
    }

    // ── Handler globale tasti (include Escape) ────────────────────────────────
    // già registrato in _init(), qui aggiungiamo Escape
    _onKeyDown(e) {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        if (this._overlayEl) {
          this._closeModal();
        } else {
          this._launch();
        }
        return;
      }

      if (e.key === 'Escape' && this._overlayEl) {
        this._closeModal();
      }
    }

  } // end class AxiosGradeTracker

  // ── Istanziazione automatica ──────────────────────────────────────────────
  new AxiosGradeTracker();

})(); // IIFE — zero scope globale
