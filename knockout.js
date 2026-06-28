/* Eliminatorias — Porra Mundial 2026
 * Participantes: edita PARTICIPANTS más abajo (ver README.md).
 * Tras cambios: sync-html.bat → preparar-deploy.bat → git push
 */
(function () {
  const KO_PASSWORD = 'Españita';
  /** Prueba local: true = plazo dieciseisavos abierto (como 10:00–21:00). Volver a false antes del deploy. */
  const KO_TEST_MODE = false;
  const KO_EXTRAS_TOTAL = 7;
  const KO_ROUND_ORDER = ['r32', 'r16', 'r8', 'r4', 'r2'];

  const PARTICIPANTS = [
    'Enrique Cuevas García',
    'Manolín',
    'Juan Medina',
    'Alicia Pérez',
    'Daniel',
    'Salomé Juanjo',
    'Juani',
    'Jenifer',
    'Nolo',
    'Manuel Montaño',
    'Francisco Romero',
    'Felipe Escobar Montaño',
    'Belén Que',
    'Chuck Norris Está Vivo',
    'María y Javi',
    'Carlos Mondragón',
    'Lego'
  ];

  const KO_ROUND_OPENS = {
    r32: '2026-06-28T10:00:00+02:00', // dieciseisavos — 10:00 peninsular
    r16: '2026-07-04T07:00:00+02:00',
    r8: '2026-07-09T07:00:00+02:00',
    r4: '2026-07-14T07:00:00+02:00',
    r2: '2026-07-19T07:00:00+02:00'
  };

  function koRoundFirstKickoffIso(matches) {
    let best = null;
    (matches || []).forEach(m => {
      if (!m || !m.sortAt) return;
      if (!best || m.sortAt < best) best = m.sortAt;
    });
    return best;
  }

  // Terceros posibles por partido R32 (Anexo FIFA — hueco 3P)
  const KO_3P_MATCH_ELIGIBLE = {
    0: ['C', 'E', 'F', 'H', 'I'],
    3: ['A', 'B', 'C', 'D', 'F'],
    4: ['B', 'E', 'F', 'I', 'J'],
    5: ['E', 'F', 'G', 'I', 'J'],
    7: ['C', 'D', 'F', 'G', 'H'],
    8: ['E', 'H', 'I', 'J', 'K'],
    9: ['D', 'E', 'I', 'J', 'L'],
    11: ['A', 'E', 'H', 'I', 'J']
  };

  const KO_R32_SEEDS = [
    ['mx', 'ec'], ['za', 'ca'], ['br', 'jp'], ['de', 'py'],
    ['us', 'ba'], ['ch', 'dz'], ['es', 'at'], ['fr', 'se'],
    ['gb-eng', 'cd'], ['co', 'gh'], ['pt', 'hr'], ['be', 'sn'],
    ['ar', 'cv'], ['nl', 'ma'], ['au', 'eg'], ['ci', 'no']
  ];

  // Plantilla de cruces R32 (bracket FIFA) — 3P = mejor tercero (se define al cerrar grupos)
  const KO_R32_SLOT_TEMPLATES = [
    { home: '1A', away: '3P' },
    { home: '2A', away: '2B' },
    { home: '1C', away: '2F' },
    { home: '1E', away: '3P' },
    { home: '1D', away: '3P' },
    { home: '1B', away: '3P' },
    { home: '1H', away: '2J' },
    { home: '1I', away: '3P' },
    { home: '1L', away: '3P' },
    { home: '1K', away: '3P' },
    { home: '2K', away: '2L' },
    { home: '1G', away: '3P' },
    { home: '1J', away: '2H' },
    { home: '1F', away: '2C' },
    { home: '2D', away: '2G' },
    { home: '2E', away: '2I' }
  ];

  // Horarios peninsulares (CEST, España) — orden FIFA partidos 73-88 por sortAt al mostrar
  const R32_META = [
    { fifaNo: 79, date: 'Mié 1 Jul', hour: '03:00', venue: 'Estadio Azteca, Ciudad de México', sortAt: '2026-07-01T03:00:00+02:00' },
    { fifaNo: 73, date: 'Dom 28 Jun', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-06-28T21:00:00+02:00' },
    { fifaNo: 76, date: 'Lun 29 Jun', hour: '19:00', venue: 'NRG Stadium, Houston', sortAt: '2026-06-29T19:00:00+02:00' },
    { fifaNo: 74, date: 'Lun 29 Jun', hour: '22:30', venue: 'Gillette Stadium, Boston', sortAt: '2026-06-29T22:30:00+02:00' },
    { fifaNo: 81, date: 'Jue 2 Jul', hour: '02:00', venue: "Levi's Stadium, San Francisco", sortAt: '2026-07-02T02:00:00+02:00' },
    { fifaNo: 85, date: 'Vie 3 Jul', hour: '05:00', venue: 'BC Place, Vancouver', sortAt: '2026-07-03T05:00:00+02:00' },
    { fifaNo: 84, date: 'Mié 2 Jul', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-07-02T21:00:00+02:00' },
    { fifaNo: 77, date: 'Mar 30 Jun', hour: '23:00', venue: 'MetLife Stadium, Nueva York', sortAt: '2026-06-30T23:00:00+02:00' },
    { fifaNo: 80, date: 'Mié 1 Jul', hour: '18:00', venue: 'Mercedes-Benz, Atlanta', sortAt: '2026-07-01T18:00:00+02:00' },
    { fifaNo: 87, date: 'Sáb 4 Jul', hour: '03:30', venue: 'Arrowhead Stadium, Kansas City', sortAt: '2026-07-04T03:30:00+02:00' },
    { fifaNo: 83, date: 'Vie 3 Jul', hour: '01:00', venue: 'BMO Field, Toronto', sortAt: '2026-07-03T01:00:00+02:00' },
    { fifaNo: 82, date: 'Mié 1 Jul', hour: '22:00', venue: 'Lumen Field, Seattle', sortAt: '2026-07-01T22:00:00+02:00' },
    { fifaNo: 86, date: 'Sáb 4 Jul', hour: '00:00', venue: 'Hard Rock Stadium, Miami', sortAt: '2026-07-04T00:00:00+02:00' },
    { fifaNo: 75, date: 'Mar 30 Jun', hour: '03:00', venue: 'Estadio BBVA, Monterrey', sortAt: '2026-06-30T03:00:00+02:00' },
    { fifaNo: 88, date: 'Vie 3 Jul', hour: '20:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-03T20:00:00+02:00' },
    { fifaNo: 78, date: 'Mar 30 Jun', hour: '19:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-06-30T19:00:00+02:00' }
  ];

  const R16_META = [
    { fifaNo: 90, date: 'Sáb 4 Jul', hour: '19:00', venue: 'NRG Stadium, Houston', sortAt: '2026-07-04T19:00:00+02:00' },
    { fifaNo: 89, date: 'Sáb 4 Jul', hour: '23:00', venue: 'Lincoln Financial, Filadelfia', sortAt: '2026-07-04T23:00:00+02:00' },
    { fifaNo: 91, date: 'Dom 5 Jul', hour: '22:00', venue: 'MetLife Stadium, Nueva York', sortAt: '2026-07-05T22:00:00+02:00' },
    { fifaNo: 92, date: 'Lun 6 Jul', hour: '02:00', venue: 'Estadio Azteca, Ciudad de México', sortAt: '2026-07-06T02:00:00+02:00' },
    { fifaNo: 93, date: 'Lun 6 Jul', hour: '21:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-06T21:00:00+02:00' },
    { fifaNo: 94, date: 'Mar 7 Jul', hour: '02:00', venue: 'Lumen Field, Seattle', sortAt: '2026-07-07T02:00:00+02:00' },
    { fifaNo: 95, date: 'Mar 7 Jul', hour: '18:00', venue: 'Mercedes-Benz, Atlanta', sortAt: '2026-07-07T18:00:00+02:00' },
    { fifaNo: 96, date: 'Mar 7 Jul', hour: '22:00', venue: 'BC Place, Vancouver', sortAt: '2026-07-07T22:00:00+02:00' }
  ];

  const R8_META = [
    { fifaNo: 97, date: 'Jue 9 Jul', hour: '22:00', venue: 'Gillette Stadium, Boston', sortAt: '2026-07-09T22:00:00+02:00' },
    { fifaNo: 98, date: 'Vie 10 Jul', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-07-10T21:00:00+02:00' },
    { fifaNo: 99, date: 'Sáb 11 Jul', hour: '23:00', venue: 'Hard Rock Stadium, Miami', sortAt: '2026-07-11T23:00:00+02:00' },
    { fifaNo: 100, date: 'Dom 12 Jul', hour: '03:00', venue: 'Arrowhead Stadium, Kansas City', sortAt: '2026-07-12T03:00:00+02:00' }
  ];

  const R4_META = [
    { fifaNo: 101, date: 'Mar 14 Jul', hour: '21:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-14T21:00:00+02:00' },
    { fifaNo: 102, date: 'Mié 15 Jul', hour: '21:00', venue: 'Mercedes-Benz, Atlanta', sortAt: '2026-07-15T21:00:00+02:00' }
  ];

  const FINAL_META = { fifaNo: 104, date: 'Dom 19 Jul', hour: '21:00', venue: 'MetLife Stadium, Nueva York', sortAt: '2026-07-19T21:00:00+02:00' };

  function mkKoMatch(id, home, away, meta) {
    return {
      id,
      home: home || 'tbd',
      away: away || 'tbd',
      date: meta.date,
      hour: meta.hour,
      venue: meta.venue,
      fifaNo: meta.fifaNo || null,
      sortAt: meta.sortAt || ''
    };
  }

  function koSortMatches(matches) {
    return matches.slice().sort((a, b) => {
      if (a.sortAt && b.sortAt) return a.sortAt.localeCompare(b.sortAt);
      if (a.fifaNo && b.fifaNo) return a.fifaNo - b.fifaNo;
      return 0;
    });
  }

  const KO_R32_MATCHES = KO_R32_SLOT_TEMPLATES.map((tpl, i) => {
    const pair = KO_R32_SEEDS[i] || ['tbd', 'tbd'];
    return Object.assign(mkKoMatch('KO32-' + (i + 1), pair[0], pair[1], R32_META[i]), {
      homeSlot: tpl.home,
      awaySlot: tpl.away
    });
  });

  const KO_R16_MATCHES = R16_META.map((meta, i) =>
    mkKoMatch('KO16-' + (i + 1), null, null, meta)
  );

  const KO_R8_MATCHES = R8_META.map((meta, i) =>
    mkKoMatch('KO8-' + (i + 1), null, null, meta)
  );

  const KO_R4_MATCHES = R4_META.map((meta, i) =>
    mkKoMatch('KO4-' + (i + 1), null, null, meta)
  );

  const KO_FINAL_MATCHES = [mkKoMatch('KOF-1', null, null, FINAL_META)];

  const KO_ROUNDS = {
    r32: { key: 'r32', label: 'Dieciseisavos', short: '16avos', matches: KO_R32_MATCHES },
    r16: { key: 'r16', label: 'Octavos', short: 'Octavos', matches: KO_R16_MATCHES },
    r8: { key: 'r8', label: 'Cuartos de final', short: 'Cuartos', matches: KO_R8_MATCHES },
    r4: { key: 'r4', label: 'Semifinales', short: 'Semis', matches: KO_R4_MATCHES },
    r2: { key: 'r2', label: 'Final', short: 'Final', matches: KO_FINAL_MATCHES }
  };

  /** Cierre de pronósticos = pitido del primer partido de la ronda (solo r32 por ahora). */
  const KO_ROUND_CLOSES = {
    r32: koRoundFirstKickoffIso(KO_R32_MATCHES) || '2026-06-28T21:00:00+02:00'
  };

  /** Especiales y dieciseisavos comparten plazo: 10:00–21:00 del 28 jun. */
  const KO_EXTRAS_LOCK_AT = KO_ROUND_CLOSES.r32;

  const koMatchMap = new Map();
  KO_ROUND_ORDER.forEach(k => KO_ROUNDS[k].matches.forEach(m => koMatchMap.set(m.id, m)));

  const KO_R32_CODES = new Set();
  const KO_R32_CORNER_1 = new Set(); // G1 — superior izquierda
  const KO_R32_CORNER_2 = new Set(); // G2 — superior derecha
  const KO_R32_CORNER_3 = new Set(); // G3 — inferior izquierda
  const KO_R32_CORNER_4 = new Set(); // G4 — inferior derecha
  /** Índices KO_R32_SEEDS por esquina (árbol FIFA: octavos P89–P96). */
  const KO_R32_CORNER_MATCH_IDX = {
    G1: [1, 3, 13, 7],  // P73, P74, P75, P77
    G2: [2, 15, 0, 8],  // P76, P78, P79, P80
    G3: [4, 11, 10, 6], // P81, P82, P83, P84
    G4: [5, 12, 9, 14]  // P85, P86, P87, P88
  };
  const KO_R32_CORNER_SET_BY_KEY = {
    G1: KO_R32_CORNER_1,
    G2: KO_R32_CORNER_2,
    G3: KO_R32_CORNER_3,
    G4: KO_R32_CORNER_4
  };

  function rebuildKoR32CornerSets() {
    KO_R32_CODES.clear();
    KO_R32_CORNER_1.clear();
    KO_R32_CORNER_2.clear();
    KO_R32_CORNER_3.clear();
    KO_R32_CORNER_4.clear();
    Object.keys(KO_R32_CORNER_MATCH_IDX).forEach(corner => {
      const cornerSet = KO_R32_CORNER_SET_BY_KEY[corner];
      KO_R32_CORNER_MATCH_IDX[corner].forEach(i => {
        (KO_R32_SEEDS[i] || []).forEach(code => {
          if (!code || code === 'tbd') return;
          KO_R32_CODES.add(code);
          cornerSet.add(code);
        });
      });
    });
  }

  rebuildKoR32CornerSets();

  function compareKoThirdEntry(a, b) {
    if (typeof window.compareThirdPlaceEntry === 'function') return window.compareThirdPlaceEntry(a, b);
    return b.p - a.p || b.gd - a.gd || b.gf - a.gf || (a.name || '').localeCompare(b.name || '', 'es');
  }

  function collectKoBestThirdPlaces(standings) {
    const thirds = [];
    Object.keys(standings).forEach(groupId => {
      const table = standings[groupId];
      if (!table || table.length < 3) return;
      const row = table[2];
      if (!row || !row.g) return;
      thirds.push({
        groupId,
        code: row.code,
        name: row.name,
        p: row.p,
        gd: row.gd,
        gf: row.gf
      });
    });
    thirds.sort(compareKoThirdEntry);
    return thirds.slice(0, 8);
  }

  function koWinnerGroupFor3PSlot(matchIdx) {
    const tpl = KO_R32_SLOT_TEMPLATES[matchIdx];
    if (!tpl || !tpl.home) return null;
    const m = String(tpl.home).match(/^1([A-L])$/);
    return m ? m[1] : null;
  }

  /** Asignación Anexo C FIFA: según qué 8 grupos aportan tercero (no greedy por ranking). */
  function assignKoThirdPlaceCodes(standings) {
    const qualifying = collectKoBestThirdPlaces(standings);
    if (qualifying.length < 8) return {};
    const annex = typeof window !== 'undefined' && window.KO_ANNEX_C;
    if (!annex || !annex.lookup) return {};
    const combo = qualifying.map(t => t.groupId).sort().join('');
    const byWinner = annex.lookup.get(combo);
    if (!byWinner) return {};
    const byMatch = {};
    Object.keys(KO_3P_MATCH_ELIGIBLE).forEach(idxStr => {
      const idx = Number(idxStr);
      const winnerGroup = koWinnerGroupFor3PSlot(idx);
      if (!winnerGroup) return;
      const thirdGroup = byWinner[winnerGroup];
      if (!thirdGroup) return;
      const table = standings[thirdGroup];
      const code = table && table[2] && table[2].code;
      if (code) byMatch[idx] = code;
    });
    return byMatch;
  }

  function resolveKoR32Slot(slot, standings, thirdByMatch, matchIdx, fallback) {
    if (slot === '3P') return (thirdByMatch && thirdByMatch[matchIdx]) || fallback || 'tbd';
    if (!slot) return fallback || 'tbd';
    const m = String(slot).match(/^([12])([A-L])$/);
    if (!m) return fallback || 'tbd';
    const pos = m[1] === '1' ? 0 : 1;
    const groupId = m[2];
    const table = standings && standings[groupId];
    if (!table || !table[pos] || !table[pos].code) return fallback || 'tbd';
    return table[pos].code;
  }

  function syncKnockoutGroupSeeds(standings) {
    if (!standings || typeof standings !== 'object') return;
    const thirdByMatch = assignKoThirdPlaceCodes(standings);
    KO_R32_SLOT_TEMPLATES.forEach((tpl, i) => {
      const prev = KO_R32_SEEDS[i] || ['tbd', 'tbd'];
      const home = resolveKoR32Slot(tpl.home, standings, thirdByMatch, i, prev[0]);
      const away = resolveKoR32Slot(tpl.away, standings, thirdByMatch, i, prev[1]);
      KO_R32_SEEDS[i][0] = home;
      KO_R32_SEEDS[i][1] = away;
      const match = KO_R32_MATCHES[i];
      if (match) {
        match.home = home;
        match.away = away;
      }
    });
    rebuildKoR32CornerSets();
  }

  const KO_SEMI_SLOT_LABELS = ['SF izq. 1', 'SF der. 1', 'SF izq. 2', 'SF der. 2'];
  const KO_SEMI_CORNER_LABELS = ['Grupo 1 (sup-izq)', 'Grupo 2 (sup-der)', 'Grupo 3 (inf-izq)', 'Grupo 4 (inf-der)'];
  const KO_SEMI_CORNER_KEYS = ['G1', 'G2', 'G3', 'G4'];
  const KO_SEMI_SIDES = [
    {
      key: 'left',
      title: '◀ LADO IZQUIERDO DEL CUADRO',
      short: 'izquierdo',
      hint: 'Elige 2 semifinalistas de este lado del cuadro.',
      slotsSummary: 'Estos son tus semifinalistas del lado izquierdo del cuadro',
      indices: [0, 2],
      corners: ['G1', 'G3'],
      zones: [
        { corner: 'G1', index: 0, pickLabel: 'Elige tu semifinalista 1 de estos', slotLabel: 'SEMIFINALISTA 1' },
        { corner: 'G3', index: 2, pickLabel: 'Elige tu semifinalista 2 de estos', slotLabel: 'SEMIFINALISTA 2' }
      ]
    },
    {
      key: 'right',
      title: 'LADO DERECHO DEL CUADRO ▶',
      short: 'derecho',
      hint: 'Elige 2 semifinalistas de este lado del cuadro.',
      slotsSummary: 'Estos son tus semifinalistas del lado derecho del cuadro',
      indices: [1, 3],
      corners: ['G2', 'G4'],
      zones: [
        { corner: 'G2', index: 1, pickLabel: 'Elige tu semifinalista 1 de estos', slotLabel: 'SEMIFINALISTA 1' },
        { corner: 'G4', index: 3, pickLabel: 'Elige tu semifinalista 2 de estos', slotLabel: 'SEMIFINALISTA 2' }
      ]
    }
  ];
  const KO_FINAL_SIDES = [
    { key: 'left', index: 0, title: 'LADO IZQUIERDO', bracketSide: 'IZQUIERDO' },
    { key: 'right', index: 1, title: 'LADO DERECHO', bracketSide: 'DERECHO' }
  ];
  const KO_FINAL_SLOT_LABELS = ['Finalista — lado izquierdo', 'Finalista — lado derecho'];
  const KO_CORNER_HINTS = {
    G1: 'G1 (superior izquierda)',
    G2: 'G2 (superior derecha)',
    G3: 'G3 (inferior izquierda)',
    G4: 'G4 (inferior derecha)'
  };

  let koStore = { activeUser: '', users: {} };
  let koMatchClickBound = false;
  let koExtrasClickBound = false;
  let koExtraWarn = '';
  let koActiveExtraSlot = null;
  let koPasswordFails = 0;
  let koWasComplete = false;
  let koWasExtrasComplete = false;
  let _koExtrasCelebrationInit = false;
  let _koStatusCelebrationInit = false;

  function emptyUserData() {
    return { picks: {}, extras: normalizeKoExtras({}) };
  }

  function getActiveKoUser() {
    const u = koStore.activeUser;
    return u && PARTICIPANTS.includes(u) ? u : '';
  }

  function ensureUserData(name) {
    if (!name || !PARTICIPANTS.includes(name)) return;
    if (!koStore.users[name]) koStore.users[name] = emptyUserData();
    koStore.users[name].picks = migrateKoPicks(koStore.users[name].picks);
    koStore.users[name].extras = sanitizeKoExtras(koStore.users[name].extras);
  }

  function getActiveKoData() {
    const user = getActiveKoUser();
    if (!user) return emptyUserData();
    ensureUserData(user);
    return koStore.users[user];
  }

  function refreshKnockoutUI() {
    renderKnockoutUserBar();
    renderKnockoutExtras();
    renderKnockoutMatches();
    updateKnockoutStatus();
    if (typeof renderQualifiedSummary === 'function') renderQualifiedSummary();
  }

  function setActiveKoUser(name) {
    if (!name) {
      koStore.activeUser = '';
      koActiveExtraSlot = null;
      koExtraWarn = '';
      saveKnockoutStore();
      refreshKnockoutUI();
      return;
    }
    if (!PARTICIPANTS.includes(name)) return;
    koStore.activeUser = name;
    ensureUserData(name);
    saveKnockoutStore();
    refreshKnockoutUI();
  }

  function isKnockoutPreviewUnlocked() {
    try {
      return sessionStorage.getItem('porra2026_ko_preview') === '1';
    } catch (e) {
      return false;
    }
  }

  function isKnockoutPublicOpen() {
    if (KO_TEST_MODE) return true;
    return Date.now() >= new Date(KO_ROUND_OPENS.r32).getTime();
  }

  function isKnockoutAccessible() {
    return isKnockoutPublicOpen() || isKnockoutPreviewUnlocked();
  }

  function isKoRoundStarted(key) {
    if (!isKnockoutAccessible()) return false;
    if (KO_TEST_MODE && key === 'r32') return true;
    return Date.now() >= new Date(KO_ROUND_OPENS[key]).getTime();
  }

  function isKoRoundClosed(key) {
    const closeAt = KO_ROUND_CLOSES[key];
    if (!closeAt) return false;
    if (KO_TEST_MODE && key === 'r32') return false;
    return Date.now() >= new Date(closeAt).getTime();
  }

  function isKoRoundPickable(key) {
    return isKoRoundStarted(key) && !isKoRoundClosed(key);
  }

  function isKoRoundOpen(key) {
    return isKoRoundPickable(key);
  }

  function formatKoOpensAtShort(key) {
    const d = new Date(KO_ROUND_OPENS[key]);
    const date = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return date + ' · ' + time;
  }

  function formatKoRoundCloseShort(key) {
    const closeAt = KO_ROUND_CLOSES[key];
    if (!closeAt) return '';
    const d = new Date(closeAt);
    const date = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return date + ' · ' + time;
  }

  function getCountdownToKoRoundClose(key) {
    const closeAt = KO_ROUND_CLOSES[key];
    if (!closeAt || !isKoRoundPickable(key)) return null;
    const ms = new Date(closeAt).getTime() - Date.now();
    if (ms <= 0) return null;
    const total = Math.floor(ms / 1000);
    return {
      h: Math.floor(total / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
      ms
    };
  }

  function tryUnlockKnockout(password) {
    if (password !== KO_PASSWORD) return false;
    try {
      sessionStorage.setItem('porra2026_ko_preview', '1');
    } catch (e) { /* */ }
    return true;
  }

  function showKoPasswordModal() {
    const modal = document.getElementById('koPasswordModal');
    if (modal) modal.classList.remove('hidden');
    const inp = document.getElementById('koPasswordInput');
    if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 100); }
    const err = document.getElementById('koPasswordError');
    if (err) {
      err.classList.remove('ko-modal-error--big');
      err.textContent = '';
    }
  }

  function hideKoPasswordModal() {
    const modal = document.getElementById('koPasswordModal');
    if (modal) modal.classList.add('hidden');
  }

  function submitKoPassword() {
    const inp = document.getElementById('koPasswordInput');
    const err = document.getElementById('koPasswordError');
    if (!inp) return;
    if (tryUnlockKnockout(inp.value.trim())) {
      koPasswordFails = 0;
      hideKoPasswordModal();
      if (typeof updatePhaseTabs === 'function') updatePhaseTabs();
      renderKnockout();
      if (typeof switchPhaseTab === 'function') switchPhaseTab('extras');
    } else if (err) {
      koPasswordFails++;
      if (koPasswordFails >= 3) {
        err.classList.add('ko-modal-error--big');
        err.textContent = 'Demasiados intentos. Vuelve a probar en un momento.';
      } else {
        err.classList.remove('ko-modal-error--big');
        err.textContent = 'Código incorrecto.';
      }
    }
  }

  function isValidKoPick(pick) {
    return pick === 'home' || pick === 'away';
  }

  function isKoExtrasLocked() {
    if (KO_TEST_MODE) return false;
    return Date.now() >= new Date(KO_EXTRAS_LOCK_AT).getTime();
  }

  function formatKoExtrasLockShort() {
    const d = new Date(KO_EXTRAS_LOCK_AT);
    const date = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return date + ' · ' + time;
  }

  function isKoExtrasEditable() {
    if (!shouldShowKoExtrasSection() || isKoExtrasLocked()) return false;
    return true;
  }

  function shouldShowKoExtrasSection() {
    return isKnockoutAccessible();
  }

  function showKoExtraBadges() {
    return isKnockoutAccessible() && !!getActiveKoUser();
  }

  function isMatchReady(m) {
    return !!(m && m.home && m.home !== 'tbd' && m.away && m.away !== 'tbd');
  }

  function getRoundKeyForMatch(matchId) {
    for (const key of KO_ROUND_ORDER) {
      if (KO_ROUNDS[key].matches.some(m => m.id === matchId)) return key;
    }
    return null;
  }

  function migrateKoPicks(picks) {
    if (!picks || typeof picks !== 'object') return {};
    const out = {};
    Object.keys(picks).forEach(id => {
      if (!/^KO(32|16|8|4|F)-/.test(id)) return;
      const p = picks[id];
      if (p === 'home' || p === 'away') out[id] = p;
      else if (p === '1') out[id] = 'home';
      else if (p === '2') out[id] = 'away';
      else if (isValidKoPick(p)) out[id] = p;
    });
    return out;
  }

  function normalizeKoExtras(ex) {
    const out = { semis: ['', '', '', ''], finalists: ['', ''], champion: '' };
    if (!ex || typeof ex !== 'object') return out;
    if (Array.isArray(ex.semis)) ex.semis.forEach((c, i) => { if (i < 4) out.semis[i] = c || ''; });
    if (Array.isArray(ex.finalists)) ex.finalists.forEach((c, i) => { if (i < 2) out.finalists[i] = c || ''; });
    if (ex.champion) out.champion = ex.champion;
    return out;
  }

  function loadKnockoutStore() {
    const sessionUser = koStore.activeUser;
    try {
      const raw = localStorage.getItem('porra2026_knockout');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users && typeof parsed.users === 'object') {
          koStore = { activeUser: '', users: parsed.users };
        } else if (parsed && (parsed.picks || parsed.extras)) {
          const legacyName = PARTICIPANTS[0];
          koStore = {
            activeUser: '',
            users: {
              [legacyName]: {
                picks: migrateKoPicks(parsed.picks),
                extras: normalizeKoExtras(parsed.extras)
              }
            }
          };
        }
      }
    } catch (e) {
      koStore = { activeUser: '', users: {} };
    }
    if (sessionUser && PARTICIPANTS.includes(sessionUser)) {
      koStore.activeUser = sessionUser;
    }
    PARTICIPANTS.forEach(ensureUserData);
  }

  function saveKnockoutStore() {
    try {
      localStorage.setItem('porra2026_knockout', JSON.stringify({ users: koStore.users }));
    } catch (e) { /* */ }
  }

  function teamNameKo(code) {
    if (!code || code === 'tbd') return 'Por definir';
    const t = typeof teamByCode === 'function' ? teamByCode(code) : null;
    return t ? t.name : code.toUpperCase();
  }

  function teamNameKoShort(code, max) {
    max = max || 13;
    const n = teamNameKo(code);
    return n.length > max ? n.slice(0, max - 1) + '…' : n;
  }

  function koMatchNameMaxLen() {
    if (typeof window === 'undefined' || !window.innerWidth) return 14;
    const w = window.innerWidth;
    if (w < 360) return 24;
    if (w < 480) return 28;
    if (w < 640) return 30;
    if (w < 768) return 20;
    if (w < 1024) return 22;
    if (w < 1280) return 13;
    return 15;
  }

  let _koViewportBound = false;
  let _koViewportTick = null;
  function bindKoViewportResize() {
    if (_koViewportBound || typeof window === 'undefined') return;
    _koViewportBound = true;
    function bucket(w) {
      if (w < 360) return 0;
      if (w < 480) return 1;
      if (w < 640) return 2;
      if (w < 768) return 3;
      if (w < 1024) return 4;
      if (w < 1280) return 5;
      return 6;
    }
    let lastBucket = bucket(window.innerWidth);
    window.addEventListener('resize', () => {
      clearTimeout(_koViewportTick);
      _koViewportTick = setTimeout(() => {
        const b = bucket(window.innerWidth);
        if (b === lastBucket) return;
        lastBucket = b;
        const panel = document.getElementById('panelExtras');
        if (panel && !panel.classList.contains('hidden')) renderKnockoutMatches();
      }, 180);
    });
  }

  function getKoPick(matchId) {
    const p = getActiveKoData().picks[matchId] || null;
    return isValidKoPick(p) ? p : null;
  }

  function getQuinielaMatchPool() {
    const out = [];
    KO_ROUND_ORDER.forEach(key => {
      if (!isKoRoundStarted(key)) return;
      KO_ROUNDS[key].matches.forEach(m => {
        if (isMatchReady(m)) out.push(m);
      });
    });
    return out;
  }

  function getPickableMatches() {
    const out = [];
    KO_ROUND_ORDER.forEach(key => {
      if (!isKoRoundPickable(key)) return;
      KO_ROUNDS[key].matches.forEach(m => {
        if (isMatchReady(m)) out.push(m);
      });
    });
    return out;
  }

  function getPlayableMatches() {
    return getQuinielaMatchPool();
  }

  function getExportRounds() {
    return KO_ROUND_ORDER.filter(isKoRoundStarted).map(k => KO_ROUNDS[k]);
  }

  function getOpenRounds() {
    return KO_ROUND_ORDER.filter(isKoRoundPickable).map(k => KO_ROUNDS[k]);
  }

  function koMatchesRequired() {
    return getPlayableMatches().length;
  }

  function koMatchesDone() {
    return getPlayableMatches().filter(m => getKoPick(m.id)).length;
  }

  function koExtrasDone() {
    const ex = getActiveKoData().extras;
    let n = ex.semis.filter(Boolean).length + ex.finalists.filter(Boolean).length;
    if (ex.champion) n++;
    return n;
  }

  function getKnockoutExportBlockers() {
    const blockers = [];
    if (!isKnockoutAccessible()) {
      blockers.push('Las eliminatorias aún no están abiertas.');
      return blockers;
    }
    if (!getActiveKoUser()) {
      blockers.push('Elige un participante arriba.');
      return blockers;
    }
    const ex = getActiveKoData().extras;
    const extrasDone = koExtrasDone();
    if (extrasDone < KO_EXTRAS_TOTAL) {
      blockers.push(`Especiales: ${extrasDone}/${KO_EXTRAS_TOTAL} (semis por esquinas, finalistas y campeón).`);
    }
    const req = koMatchesRequired();
    const md = koMatchesDone();
    if (req === 0) {
      if (!isKoRoundStarted('r32')) {
        blockers.push(`Quiniela dieciseisavos: abre el ${formatKoOpensAtShort('r32')} — el PDF se activará al completar especiales y partidos.`);
      } else {
        blockers.push('Quiniela: aún no hay cruces completos para marcar (faltan equipos por clasificar).');
      }
    } else if (md < req) {
      const r32Closed = isKoRoundClosed('r32');
      const r32Total = KO_R32_MATCHES.filter(isMatchReady).length;
      const r32Done = KO_R32_MATCHES.filter(m => isMatchReady(m) && getKoPick(m.id)).length;
      if (r32Closed && r32Total > 0 && r32Done < r32Total) {
        blockers.push(`Dieciseisavos cerrados (${formatKoRoundCloseShort('r32')}) — faltan ${r32Total - r32Done} pronóstico(s) (${r32Done}/${r32Total}).`);
      } else {
        blockers.push(`Partidos: ${md}/${req} ganadores marcados.`);
      }
    }
    return blockers;
  }

  function isKnockoutComplete() {
    return getKnockoutExportBlockers().length === 0;
  }

  function scrollToKnockoutIncomplete() {
    if (!getActiveKoUser()) {
      document.getElementById('koUserSelect')?.focus();
      return;
    }
    if (koExtrasDone() < KO_EXTRAS_TOTAL) {
      document.getElementById('koExtrasSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const open = getOpenRounds();
    for (const round of open) {
      const missing = round.matches.filter(m => isMatchReady(m) && !getKoPick(m.id));
      if (missing.length) {
        const el = document.getElementById('ko-mr-' + missing[0].id) || document.getElementById('ko-round-' + round.key);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    document.getElementById('btnExportKo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function exportKnockoutPDF() {
    const blockers = getKnockoutExportBlockers();
    if (blockers.length) {
      alert('Para exportar el PDF:\n\n• ' + blockers.join('\n• '));
      scrollToKnockoutIncomplete();
      return;
    }
    const btn = document.getElementById('btnExportKo');
    if (btn) {
      btn.classList.add('is-exporting', 'opacity-60');
      btn.setAttribute('aria-disabled', 'true');
    }
    try {
      await exportKnockoutPDFInner();
    } catch (err) {
      console.error('exportKnockoutPDF', err);
      alert('No se pudo generar el PDF de eliminatorias. Prueba de nuevo (Ctrl+F5) o revisa la consola.');
    } finally {
      updateKnockoutStatus();
      if (btn) btn.classList.remove('is-exporting', 'opacity-60');
    }
  }

  function getKoBracketSide(code) {
    if (!code) return '';
    if (KO_R32_CORNER_1.has(code) || KO_R32_CORNER_2.has(code)) return 'ARRIBA';
    if (KO_R32_CORNER_3.has(code) || KO_R32_CORNER_4.has(code)) return 'ABAJO';
    return '';
  }

  function getKoCorner(code) {
    if (!code) return '';
    if (KO_R32_CORNER_1.has(code)) return 'G1';
    if (KO_R32_CORNER_2.has(code)) return 'G2';
    if (KO_R32_CORNER_3.has(code)) return 'G3';
    if (KO_R32_CORNER_4.has(code)) return 'G4';
    return '';
  }

  function getKoR32TeamsByCorner(corner) {
    const seen = new Set();
    const teams = [];
    const indices = KO_R32_CORNER_MATCH_IDX[corner];
    if (!indices) return teams;
    indices.forEach(i => {
      (KO_R32_SEEDS[i] || []).forEach(code => {
        if (!code || code === 'tbd' || seen.has(code)) return;
        seen.add(code);
        teams.push({ code, name: teamNameKo(code) });
      });
    });
    return teams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function getSemiSlotCorner(index) {
    return KO_SEMI_CORNER_KEYS[index] || '';
  }

  function getSemiSideKeyForIndex(index) {
    const side = KO_SEMI_SIDES.find(s => s.indices.includes(index));
    return side ? side.key : '';
  }

  function getSemiZoneRepeatMessage(side, zone, ex) {
    const other = side.zones.find(z => z.index !== zone.index);
    if (!ex.semis[zone.index]) return '';
    if (other && !ex.semis[other.index]) {
      const zoneNum = side.zones.findIndex(z => z.index === zone.index) + 1;
      return `Ya elegiste tu semifinalista ${zoneNum}. Ahora elige el <strong>otro</strong> (la otra mitad).`;
    }
    return `Ya tienes los 2 del lado ${side.short}. Toca una casilla de abajo para cambiar.`;
  }

  function getCornerHint(corner) {
    const side = KO_SEMI_SIDES.find(s => s.corners.includes(corner));
    if (side) return side.short;
    return KO_CORNER_HINTS[corner] || corner;
  }

  function getKoR32TeamsBySide(sideKey) {
    const side = KO_SEMI_SIDES.find(s => s.key === sideKey);
    if (!side) return [];
    const seen = new Set();
    const teams = [];
    side.corners.forEach(corner => {
      getKoR32TeamsByCorner(corner).forEach(t => {
        if (seen.has(t.code)) return;
        seen.add(t.code);
        teams.push(t);
      });
    });
    return teams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function getFinalSlotBracketSide(index) {
    return index === 0 ? 'IZQUIERDO' : 'DERECHO';
  }

  function getFinalSlotSide(index) {
    return getFinalSlotBracketSide(index);
  }

  function getKoFinalistBracketSide(code, ex) {
    if (!code) return '';
    if (ex && Array.isArray(ex.semis)) {
      const idx = ex.semis.indexOf(code);
      if (idx >= 0) return idx === 0 || idx === 2 ? 'IZQUIERDO' : 'DERECHO';
    }
    const c = getKoCorner(code);
    if (c === 'G1' || c === 'G3') return 'IZQUIERDO';
    if (c === 'G2' || c === 'G4') return 'DERECHO';
    return '';
  }

  function findSemiSlotIndexByCorner(ex, corner) {
    const idx = KO_SEMI_CORNER_KEYS.indexOf(corner);
    if (idx < 0) return -1;
    return ex.semis[idx] ? -1 : idx;
  }

  function requireKoUserForPick() {
    if (getActiveKoUser()) return true;
    koExtraWarn = '👆 <strong>Primero elige participante</strong> en el desplegable de arriba (debajo de las instrucciones).';
    renderKnockoutExtras();
    requestAnimationFrame(() => {
      document.getElementById('koUserSelect')?.focus();
      document.getElementById('koPlayerBar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return false;
  }

  function getKoR32TeamsSorted() {
    const seen = new Set();
    const teams = [];
    KO_R32_SEEDS.forEach(pair => {
      pair.forEach(code => {
        if (seen.has(code)) return;
        seen.add(code);
        teams.push({ code, name: teamNameKo(code) });
      });
    });
    return teams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function isKoR32Team(code) {
    return !!code && KO_R32_CODES.has(code);
  }

  function sanitizeKoExtras(ex) {
    const out = normalizeKoExtras(ex);
    out.semis = out.semis.map((c, i) => {
      if (!c || !isKoR32Team(c)) return '';
      if (getKoCorner(c) !== getSemiSlotCorner(i)) return '';
      return c;
    });
    const semiSet = new Set(out.semis.filter(Boolean));
    out.finalists = out.finalists.map((c, i) => {
      if (!c || !semiSet.has(c)) return '';
      if (getKoFinalistBracketSide(c, out) !== getFinalSlotBracketSide(i)) return '';
      return c;
    });
    const finalSet = new Set(out.finalists.filter(Boolean));
    out.champion = out.champion && finalSet.has(out.champion) ? out.champion : '';
    return out;
  }

  function showKoExtraOnMatch(matchId) {
    return getRoundKeyForMatch(matchId) === 'r32';
  }

  const KO_ROLE_META = {
    semi: { label: 'SEMI', labelPdf: 'SEMI', title: 'Semifinalista', color: '#e9d5ff', bg: 'rgba(147,51,234,.35)', border: '#c084fc' },
    finalist: { label: 'FINAL', labelPdf: 'FINAL', title: 'Finalista', color: '#ffedd5', bg: 'rgba(249,115,22,.35)', border: '#fb923c' },
    champion: { label: 'CAMPEÓN', labelPdf: 'CAMPEON', title: 'Campeón', color: '#fef08a', bg: 'rgba(250,204,21,.35)', border: '#fde047' }
  };

  function koRoleLabel(role, compact) {
    const m = KO_ROLE_META[role];
    if (!m) return '';
    if (role === 'champion' && compact) return 'CAM';
    return m.label;
  }

  function koRoleBadgeHTML(role, size) {
    if (!role || !KO_ROLE_META[role]) return '';
    const m = KO_ROLE_META[role];
    let text = m.label;
    if (size === 'xs' && role === 'champion') text = 'CAM';
    else if (size === 'sm' && role === 'champion') text = 'CAM';
    const sz = size || 'md';
    return `<span class="ko-role-badge ko-role-badge--${role} ko-role-badge--${sz}" title="${m.title}">${text}</span>`;
  }

  function koFieldToRole(field) {
    if (field === 'champion') return 'champion';
    if (field === 'finalists') return 'finalist';
    if (field === 'semis') return 'semi';
    return '';
  }

  function koAllExtraRoles(code, ex) {
    if (!code || code === 'tbd' || !ex) return [];
    const roles = [];
    if (ex.semis.includes(code)) roles.push('semi');
    if (ex.finalists.includes(code) && ex.champion !== code) roles.push('finalist');
    if (ex.champion === code) roles.push('champion');
    return roles;
  }

  function koRoleBadgesHTML(roles, size) {
    if (!roles || !roles.length) return '';
    return roles.map(r => koRoleBadgeHTML(r, size)).join('');
  }

  function getKoExtraRole(code, ex) {
    const roles = koAllExtraRoles(code, ex);
    return roles.length ? roles[roles.length - 1] : '';
  }

  function getKoExtraBadge(code) {
    if (!showKoExtraBadges() || !code || code === 'tbd') return { badge: '' };
    const ex = getActiveKoData().extras;
    const roles = koAllExtraRoles(code, ex);
    if (!roles.length) return { badge: '' };
    return { badge: `<span class="ko-role-badges">${koRoleBadgesHTML(roles, 'sm')}</span>` };
  }

  function getKoSpecialsAlive(picks) {
    const ex = getActiveKoData().extras;
    const alive = new Set();
    const out = new Set();
    getPlayableMatches().forEach(m => {
      if (!isMatchReady(m)) return;
      const pick = picks[m.id];
      if (!isValidKoPick(pick)) return;
      const winner = pick === 'home' ? m.home : m.away;
      const loser = pick === 'home' ? m.away : m.home;
      if (getKoExtraRole(winner, ex)) alive.add(winner);
      if (getKoExtraRole(loser, ex)) out.add(loser);
    });
    out.forEach(c => alive.delete(c));
    return alive;
  }

  function getKoExtraRoleInPicker(code, ex) {
    const roles = koAllExtraRoles(code, ex);
    return roles.length ? roles[roles.length - 1] : '';
  }

  function getKoPickerRoles(code, ex) {
    return koAllExtraRoles(code, ex);
  }

  function koQualificationPosHTML() {
    return '';
  }

  function koQualificationHTML() {
    return '';
  }

  function koSlotDisplayLabel() {
    return 'Por definir';
  }

  function koTeamPickBtnHTML(m, side) {
    const code = side === 'home' ? m.home : m.away;
    const slot = side === 'home' ? m.homeSlot : m.awaySlot;
    const pick = getKoPick(m.id);
    const rKey = getRoundKeyForMatch(m.id);
    const roundOpen = rKey ? isKoRoundPickable(rKey) : false;
    const ready = isMatchReady(m);
    if (!code || code === 'tbd') {
      return `<button type="button" class="ko-team-pick ko-team-pick--slot tbd" disabled>${koSlotDisplayLabel(slot)}</button>`;
    }
    const canPick = ready && roundOpen;
    const showSpecial = showKoExtraOnMatch(m.id);
    const cls = ['ko-team-pick', `ko-team-pick--${side}`];
    if (!canPick) cls.push('ko-team-pick--locked');
    if (pick === side) cls.push('winner');
    else if (pick) cls.push('eliminated');
    const flag = typeof flagHTML === 'function' ? flagHTML(code, 22) : '';
    const name = teamNameKoShort(code, koMatchNameMaxLen());
    const badges = showSpecial ? getKoExtraBadge(code).badge : '';
    const badgeRow = badges ? `<div class="ko-team-pick-badges-row">${badges}</div>` : '';
    const main = side === 'away'
      ? `<span class="ko-team-pick-main ko-team-pick-main--away"><span class="ko-team-name">${name}</span>${flag}</span>`
      : `<span class="ko-team-pick-main"><span class="ko-team-pick-flag">${flag}</span><span class="ko-team-name">${name}</span></span>`;
    return `<button type="button" class="${cls.join(' ')}" data-ko-pick-match="${m.id}" data-ko-pick-side="${side}"${canPick ? '' : ' disabled'} aria-label="Gana ${teamNameKo(code)}">
      ${badgeRow}
      ${main}
    </button>`;
  }

  function koChunkMatches(matches) {
    if (matches.length <= 3) return [matches];
    const half = Math.ceil(matches.length / 2);
    return [matches.slice(0, half), matches.slice(half)];
  }

  function koRoundMatchesHTML(matches) {
    const ordered = koSortMatches(matches);
    const chunks = koChunkMatches(ordered);
    if (chunks.length === 1) {
      return `<div class="ko-round-matches">${ordered.map(koMatchRowHTML).join('')}</div>`;
    }
    const labels = ['A', 'B'];
    return `<div class="ko-round-matches-grid">${chunks.map((chunk, i) =>
      `<div class="ko-round-col">
        <p class="ko-round-col-label">${labels[i] || i + 1}</p>
        ${chunk.map(koMatchRowHTML).join('')}
      </div>`
    ).join('')}</div>`;
  }

  function koMatchRowHTML(m) {
    const pick = getKoPick(m.id);
    return `<div class="ko-list-match px-3 py-2.5" id="ko-mr-${m.id}">
      <div class="match-meta">
        <span class="text-xs text-gray-500">${m.date}</span>
        <span class="hora-badge" title="Hora peninsular (España)">${m.hour} ESP</span>
        <span class="sede-badge">${m.venue}</span>
      </div>
      <div class="ko-list-pair${pick ? ' has-pick' : ''}">
        ${koTeamPickBtnHTML(m, 'home')}
        <span class="ko-vs" aria-hidden="true">vs</span>
        ${koTeamPickBtnHTML(m, 'away')}
      </div>
    </div>`;
  }

  function koRoundCardHTML(round, opts) {
    opts = opts || {};
    const playable = round.matches.filter(isMatchReady);
    const done = playable.filter(m => getKoPick(m.id)).length;
    const total = playable.length;
    const allDefined = round.matches.every(isMatchReady);
    const complete = total > 0 && done === total;
    const pendingTeams = !allDefined;
    const preview = !!opts.preview;
    const locked = !!opts.locked;
    let statusBanner = '';
    if (preview) {
      statusBanner = `<div class="ko-round-preview-banner">🔒 Vista previa de cruces — podrás marcar ganadores desde el <strong>${formatKoOpensAtShort(round.key)}</strong> hasta el <strong>${formatKoRoundCloseShort(round.key) || 'cierre'}</strong>.</div>`;
    } else if (locked) {
      statusBanner = `<div class="ko-round-preview-banner">🔒 ${round.label} cerrados — plazo finalizado a las <strong>${formatKoRoundCloseShort(round.key)}</strong> (inicio del primer partido).</div>`;
    }
    const countLabel = preview ? 'Vista previa' : locked ? (complete ? '✓ Completo · cerrado' : `${done}/${total} · cerrado`) : (total ? (complete ? '✓ Completo' : `${done}/${total}`) : '—');
    const countClass = preview ? 'text-blue-300 font-semibold text-xs' : locked ? (complete ? 'text-green-400 font-semibold text-xs' : 'text-gray-400 font-semibold text-xs') : (complete ? 'text-green-400 font-semibold text-xs' : 'text-yellow-500 font-semibold text-xs');
    return `<div class="group-card overflow-hidden ko-round-card${complete ? ' group-complete' : ''}${locked ? ' ko-round-card--locked' : ''}" id="ko-round-${round.key}">
      <div class="group-header px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-xs font-black text-yellow-300 tracking-widest">RONDA</span>
          <span class="text-2xl font-black text-white">${round.short}</span>
        </div>
        <span class="ko-round-status text-xs text-gray-500">${round.matches.length} partido${round.matches.length === 1 ? '' : 's'} · toca al ganador</span>
      </div>
      ${statusBanner}
      <div>${koRoundMatchesHTML(round.matches)}</div>
      <div class="px-4 py-2 bg-gray-900 bg-opacity-50 flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs text-gray-600">${pendingTeams ? 'Algunos equipos aún por definir' : locked ? 'Pronósticos bloqueados' : 'Quiniela ' + round.label.toLowerCase()}</span>
        <span id="koMatchCount-${round.key}" class="${countClass}">${countLabel}</span>
      </div>
    </div>`;
  }

  function koRoundWaitingHTML(round) {
    return `<div class="ko-round-waiting" id="ko-round-${round.key}">
      <div>
        <p class="ko-round-waiting-title">⏳ ${round.label}</p>
        <p class="ko-round-waiting-hint">Equipos pendientes · ${round.matches.length} partido${round.matches.length === 1 ? '' : 's'}</p>
      </div>
      <span class="ko-round-waiting-badge">Próximamente</span>
    </div>`;
  }

  function koUpcomingRoundsHTML(rounds) {
    if (!rounds.length) return '';
    return `<div class="ko-upcoming-rounds" aria-label="Rondas próximas">
      <p class="ko-upcoming-title">Próximas rondas</p>
      ${rounds.map(r => `<div class="ko-upcoming-row"><span>🔒 ${r.label}</span><span class="ko-upcoming-date">${formatKoOpensAtShort(r.key)}</span></div>`).join('')}
    </div>`;
  }

  function bindKoMatchClicks() {
    if (koMatchClickBound) return;
    const root = document.getElementById('koBracket');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ko-pick-match][data-ko-pick-side]');
      if (!btn || btn.disabled) return;
      e.preventDefault();
      pickKoResult(btn.getAttribute('data-ko-pick-match'), btn.getAttribute('data-ko-pick-side'));
      if (btn.blur) btn.blur();
    });
    koMatchClickBound = true;
  }

  function pickKoResult(matchId, side) {
    if (!isKnockoutAccessible() || !getActiveKoUser() || !isValidKoPick(side)) return;
    const m = koMatchMap.get(matchId);
    const rKey = getRoundKeyForMatch(matchId);
    if (!m || !rKey || !isKoRoundPickable(rKey) || !isMatchReady(m)) return;
    const data = getActiveKoData();
    data.picks[matchId] = side;
    saveKnockoutStore();
    renderKoMatchRow(matchId);
    updateKoRoundCounts();
    updateKnockoutStatus();
  }

  function renderKoMatchRow(matchId) {
    const m = koMatchMap.get(matchId);
    const el = document.getElementById('ko-mr-' + matchId);
    if (!m || !el) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = koMatchRowHTML(m);
    el.replaceWith(tmp.firstElementChild);
  }

  function updateKoRoundCounts() {
    KO_ROUND_ORDER.forEach(key => {
      const round = KO_ROUNDS[key];
      if (key !== 'r32' && !isKoRoundPickable(key) && !isKoRoundStarted(key)) return;
      const el = document.getElementById('koMatchCount-' + round.key);
      const card = document.getElementById('ko-round-' + round.key);
      if (!el) return;
      const playable = round.matches.filter(isMatchReady);
      const done = playable.filter(m => getKoPick(m.id)).length;
      const complete = playable.length > 0 && done === playable.length;
      if (!isKoRoundStarted(key)) {
        el.textContent = 'Vista previa';
        el.className = 'text-blue-300 font-semibold text-xs';
        return;
      }
      if (isKoRoundClosed(key)) {
        el.textContent = complete ? '✓ Completo · cerrado' : `${done}/${playable.length} · cerrado`;
        el.className = complete ? 'text-green-400 font-semibold text-xs' : 'text-gray-400 font-semibold text-xs';
        if (card) card.classList.toggle('group-complete', complete);
        return;
      }
      if (!isKoRoundPickable(key)) return;
      el.textContent = playable.length ? (complete ? '✓ Completo' : `${done}/${playable.length}`) : '—';
      el.className = complete ? 'text-green-400 font-semibold text-xs' : 'text-yellow-500 font-semibold text-xs';
      if (card) card.classList.toggle('group-complete', complete);
    });
  }

  function clearKnockoutMatches() {
    const user = getActiveKoUser();
    if (!user) {
      alert('Elige un participante antes de limpiar.');
      return;
    }
    const pickableIds = new Set(getPickableMatches().map(m => m.id));
    if (!pickableIds.size) {
      alert('No hay partidos editables ahora mismo (la ronda puede estar cerrada).');
      return;
    }
    if (!confirm(`¿Borrar los partidos editables de eliminatorias de ${user}?\n\n✓ La quiniela de GRUPOS no se toca (queda guardada).\n✓ Los especiales (SEMI, FINAL, CAMPEÓN) no se tocan.\n✓ Las rondas cerradas no se modifican.`)) {
      return;
    }
    const picks = koStore.users[user].picks;
    Object.keys(picks).forEach(id => {
      if (pickableIds.has(id)) delete picks[id];
    });
    saveKnockoutStore();
    renderKnockoutMatches();
    updateKnockoutStatus();
  }

  function clearKnockoutAll() {
    const user = getActiveKoUser();
    if (!user) {
      alert('Elige un participante antes de limpiar.');
      return;
    }
    if (!confirm(`¿Borrar TODO de eliminatorias de ${user}?\n\n✓ La quiniela de GRUPOS no se toca (queda guardada).\n✗ Se borran partidos Y especiales de eliminatorias.`)) {
      return;
    }
    koActiveExtraSlot = null;
    koExtraWarn = '';
    koStore.users[user] = emptyUserData();
    saveKnockoutStore();
    renderKnockout();
  }

  function clearKnockoutPicks() {
    clearKnockoutAll();
  }

  function renderKnockoutUserBar() {
    const bar = document.getElementById('koPlayerBar');
    const sel = document.getElementById('koUserSelect');
    if (!bar) return;
    if (!isKnockoutAccessible()) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    bar.classList.toggle('ko-user-bar--needs-user', !getActiveKoUser());
    if (sel) {
      const active = getActiveKoUser();
      const needOptions = sel.options.length !== PARTICIPANTS.length + 1;
      if (needOptions) {
        sel.innerHTML = '<option value="">— Elige participante —</option>' +
          PARTICIPANTS.map(n => `<option value="${n.replace(/"/g, '&quot;')}">${n}</option>`).join('');
      }
      sel.value = active || '';
    }
  }

  function renderKnockoutMatches() {
    const el = document.getElementById('koBracket');
    if (!el) return;
    bindKoMatchClicks();
    if (!isKnockoutAccessible()) {
      el.innerHTML = `<div class="extras-locked">
        <p class="text-gray-400 text-sm">🔒 Las eliminatorias abren el <strong>28 de junio a las 10:00</strong> (hora peninsular).</p>
        <p class="text-xs text-gray-500 mt-2">Si tienes código de acceso anticipado, pulsa la pestaña 🏅 Eliminatorias.</p>
      </div>`;
      return;
    }
    const parts = [];
    if (KO_TEST_MODE) {
      parts.push('<div class="app-reload-banner" style="position:relative;margin-bottom:.75rem"><p>🧪 <strong>Modo prueba</strong> — dieciseisavos y especiales abiertos. Desactiva <code>KO_TEST_MODE</code> en knockout.js antes del 28 jun, 10:00.</p></div>');
    }
    const lockedRounds = [];
    KO_ROUND_ORDER.forEach(key => {
      if (key === 'r32') return;
      if (!isKoRoundPickable(key)) lockedRounds.push(KO_ROUNDS[key]);
    });

    if (!getActiveKoUser()) {
      parts.push(koRoundCardHTML(KO_ROUNDS.r32, { preview: !isKoRoundStarted('r32'), locked: isKoRoundClosed('r32') }));
      if (!isKoRoundStarted('r32')) {
        parts.push('<p class="text-yellow-500 text-sm mt-3">👆 Elige tu <strong>participante</strong> arriba para poder marcar ganadores cuando abra la ronda (28 jun, 10:00–21:00).</p>');
      } else if (isKoRoundPickable('r32')) {
        parts.push(`<p class="text-yellow-500 text-sm mt-3">👆 Elige tu <strong>participante</strong> arriba · dieciseisavos abiertos hasta el <strong>${formatKoRoundCloseShort('r32')}</strong>.</p>`);
      }
      if (lockedRounds.length) parts.push(koUpcomingRoundsHTML(lockedRounds));
      el.innerHTML = parts.join('');
      updateKoRoundCounts();
      return;
    }

    KO_ROUND_ORDER.forEach(key => {
      const round = KO_ROUNDS[key];
      if (key === 'r32') {
        if (!isKoRoundStarted('r32')) {
          parts.push(koRoundCardHTML(round, { preview: true }));
        } else if (isKoRoundPickable('r32')) {
          parts.push(koRoundCardHTML(round));
        } else if (isKoRoundClosed('r32')) {
          parts.push(koRoundCardHTML(round, { locked: true }));
        }
        return;
      }
      if (!isKoRoundPickable(key)) {
        lockedRounds.push(round);
        return;
      }
      parts.push(koRoundCardHTML(round));
    });

    if (lockedRounds.length) parts.push(koUpcomingRoundsHTML(lockedRounds));
    el.innerHTML = parts.join('') || '<p class="text-xs text-gray-500 text-center">Todas las rondas se abrirán según el calendario del Mundial.</p>';
    updateKoRoundCounts();
  }

  function isKoExtraDuplicate(ex, field, index, code) {
    if (!code) return false;
    if (field === 'semis') return ex.semis.some((c, i) => c === code && i !== index);
    if (field === 'finalists') return ex.finalists.some((c, i) => c === code && i !== index);
    return false;
  }

  function getUsedExtraCodes(ex, field, activeSlot) {
    const used = new Set();
    if (field === 'semis') ex.semis.filter(Boolean).forEach(c => used.add(c));
    else if (field === 'finalists') ex.finalists.filter(Boolean).forEach(c => used.add(c));
    if (activeSlot && activeSlot.field === field) {
      const cur = field === 'champion' ? ex.champion
        : field === 'finalists' ? ex.finalists[activeSlot.index]
        : ex.semis[activeSlot.index];
      if (cur) used.delete(cur);
    }
    return used;
  }

  function assignKoExtra(field, code) {
    if (!requireKoUserForPick()) return;
    const ex = getActiveKoData().extras;
    let index;
    if (koActiveExtraSlot && koActiveExtraSlot.field === field) {
      index = koActiveExtraSlot.index;
    } else if (field === 'champion') {
      index = 0;
    } else if (field === 'semis') {
      const corner = getKoCorner(code);
      if (!corner) {
        koExtraWarn = 'Los semifinalistas deben ser uno de los 32 equipos de dieciseisavos.';
        renderKnockoutExtras();
        return;
      }
      index = findSemiSlotIndexByCorner(ex, corner);
      if (index < 0) {
        const side = KO_SEMI_SIDES.find(s => s.corners.includes(corner));
        const zone = side?.zones.find(z => z.corner === corner);
        if (side && zone && ex.semis[zone.index]) {
          koExtraWarn = getSemiZoneRepeatMessage(side, zone, ex);
        } else if (side) {
          koExtraWarn = `Ya tienes los 2 del lado ${side.short.toLowerCase()} o esa zona está llena. Toca la casilla de abajo para cambiar.`;
        } else {
          koExtraWarn = 'Esa casilla ya está llena. Tócala para cambiar el equipo.';
        }
        renderKnockoutExtras();
        return;
      }
    } else if (field === 'finalists') {
      const side = getKoFinalistBracketSide(code, ex);
      if (!side) {
        koExtraWarn = 'El finalista debe salir de tus semifinalistas.';
        renderKnockoutExtras();
        return;
      }
      index = side === 'IZQUIERDO' ? 0 : 1;
      if (ex.finalists[index]) {
        const lado = side === 'IZQUIERDO' ? 'lado izquierdo' : 'lado derecho';
        koExtraWarn = `Ya tienes finalista del ${lado}. Toca esa casilla para cambiarlo.`;
        renderKnockoutExtras();
        return;
      }
    } else {
      index = ex[field].findIndex(s => !s);
      if (index < 0) {
        koExtraWarn = 'Casillas llenas: toca una casilla para cambiarla y luego el equipo.';
        renderKnockoutExtras();
        return;
      }
    }
    setKoExtra(field, index, code);
    koActiveExtraSlot = null;
  }

  function setKoExtra(field, index, code) {
    if (!isKoExtrasEditable()) return;
    const ex = getActiveKoData().extras;
    if (code) {
      if (field === 'semis' && !isKoR32Team(code)) {
        koExtraWarn = 'Los semifinalistas deben ser uno de los 32 equipos de dieciseisavos.';
        renderKnockoutExtras();
        return;
      }
      if (field === 'semis' && getKoCorner(code) !== getSemiSlotCorner(index)) {
        const sideKey = getSemiSideKeyForIndex(index);
        const teamSide = KO_SEMI_SIDES.find(s => s.corners.includes(getKoCorner(code)));
        koExtraWarn = teamSide && sideKey
          ? `Este equipo es del lado ${teamSide.short.toLowerCase()}. Usa una casilla del mismo lado.`
          : 'Este equipo no encaja en esa casilla. Elige otra del mismo lado.';
        renderKnockoutExtras();
        return;
      }
      if (field === 'finalists') {
        const semis = ex.semis.filter(Boolean);
        if (semis.length < 4) {
          koExtraWarn = 'Primero completa los 4 semifinalistas.';
          renderKnockoutExtras();
          return;
        }
        if (!semis.includes(code)) {
          koExtraWarn = 'Los finalistas solo pueden ser de tus 4 semifinalistas.';
          renderKnockoutExtras();
          return;
        }
        if (getKoFinalistBracketSide(code, ex) !== getFinalSlotBracketSide(index)) {
          const lado = getFinalSlotBracketSide(index) === 'IZQUIERDO' ? 'lado izquierdo' : 'lado derecho';
          koExtraWarn = `Esta casilla es del ${lado} del cuadro.`;
          renderKnockoutExtras();
          return;
        }
      }
      if (field === 'champion') {
        const finals = ex.finalists.filter(Boolean);
        if (finals.length < 2) {
          koExtraWarn = 'Primero completa los 2 finalistas.';
          renderKnockoutExtras();
          return;
        }
        if (!finals.includes(code)) {
          koExtraWarn = 'El campeón solo puede ser uno de tus 2 finalistas.';
          renderKnockoutExtras();
          return;
        }
      }
      if (isKoExtraDuplicate(ex, field, index, code)) {
        koExtraWarn = 'Ese equipo ya está en otra casilla. Elige uno distinto.';
        renderKnockoutExtras();
        return;
      }
    }
    koExtraWarn = '';
    if (field === 'champion') ex.champion = code;
    else if (field === 'semis') ex.semis[index] = code;
    else if (field === 'finalists') ex.finalists[index] = code;
    getActiveKoData().extras = sanitizeKoExtras(ex);
    saveKnockoutStore();
    renderKnockoutExtras();
    renderKnockoutMatches();
    updateKnockoutStatus();
  }

  function koExtrasReadOnlyChip(code, role) {
    const flag = typeof flagHTML === 'function' ? flagHTML(code, 28) : '';
    return `<div class="ko-extra-readonly-chip ko-extra-readonly-chip--${role}">
      <div class="ko-extra-readonly-chip-row">
        ${koRoleBadgeHTML(role, 'md')}
        <span class="ko-extra-readonly-flag">${flag}</span>
        <span class="ko-extra-readonly-name">${teamNameKo(code)}</span>
      </div>
    </div>`;
  }

  function koExtrasSemiSummaryHTML(ex) {
    return KO_SEMI_SIDES.map(side => {
      const chips = side.indices.map(i => ex.semis[i] ? koExtrasReadOnlyChip(ex.semis[i], 'semi') : '').filter(Boolean).join('');
      if (!chips) return '';
      return `<div class="ko-extras-summary-side">
        <span class="ko-extras-summary-side-label">${side.title}</span>
        <div class="ko-extras-summary-row">${chips}</div>
      </div>`;
    }).join('');
  }

  function koExtrasSummaryHTML(ex) {
    const complete = koExtrasDone() >= KO_EXTRAS_TOTAL;
    const msg = complete
      ? '🔒 Plazo cerrado — tus pronósticos especiales quedaron guardados.'
      : '🔒 Plazo cerrado — faltan pronósticos especiales y ya no se pueden marcar.';
    return `
      <p class="ko-extras-done-msg">${msg}</p>
      <div class="ko-extras-summary">
        <p class="ko-extras-summary-label">Semifinalistas</p>
        ${koExtrasSemiSummaryHTML(ex)}
        <p class="ko-extras-summary-label">Finalistas</p>
        <div class="ko-extras-summary-row">${ex.finalists.filter(Boolean).map(c => koExtrasReadOnlyChip(c, 'finalist')).join('')}</div>
        <p class="ko-extras-summary-label">Campeón</p>
        <div class="ko-extras-summary-row">${ex.champion ? koExtrasReadOnlyChip(ex.champion, 'champion') : ''}</div>
      </div>`;
  }

  function koLegendBlockHTML() {
    return `<div class="ko-legend-top" aria-label="Instrucciones">
      <p class="ko-legend-top-title">📖 Léelo primero (30 segundos)</p>
      <div class="ko-simple-legend ko-simple-legend--top">
        <p class="ko-simple-legend-row"><span class="ko-legend-swatch ko-legend-swatch--win">✓</span> <strong>Verde</strong> = el equipo que crees que <strong>gana</strong> el partido</p>
        <p class="ko-simple-legend-row"><span class="ko-legend-swatch ko-legend-swatch--lose">✗</span> <strong>Rojo</strong> = el que <strong>pierde</strong></p>
        <p class="ko-simple-legend-row">Tus pronósticos especiales se marcarán así:</p>
      </div>
      <div class="ko-r32-picker-legend ko-r32-picker-legend--top">
        <span class="ko-legend-item">${koRoleBadgeHTML('semi', 'md')} Semifinalista</span>
        <span class="ko-legend-item">${koRoleBadgeHTML('finalist', 'md')} Finalista</span>
        <span class="ko-legend-item">${koRoleBadgeHTML('champion', 'md')} Campeón</span>
      </div>
    </div>`;
  }

  function koExtrasEditorHTML(ex) {
    const done = koExtrasDone();
    const pct = Math.round((done / KO_EXTRAS_TOTAL) * 100);
    const semisFull = ex.semis.filter(Boolean).length >= 4;
    const finalsFull = ex.finalists.filter(Boolean).length >= 2;
    return `
      ${koExtraWarn ? `<p class="ko-extra-warn" role="alert">${koExtraWarn}</p>` : ''}
      ${!getActiveKoUser() ? `<p class="ko-pick-user-first" role="status">👆 <strong>Elige participante</strong> en el desplegable de arriba antes de tocar equipos.</p>` : ''}
      <p class="ko-extras-deadline-hint">Plazo conjunto con dieciseisavos: del <strong>${formatKoOpensAtShort('r32')}</strong> al <strong>${formatKoExtrasLockShort()}</strong> (inicio del primer partido).</p>
      <div class="ko-extras-progress-wrap">
        <div class="ko-extras-progress"><div class="ko-extras-progress-fill" style="width:${pct}%"></div></div>
        <span class="ko-extras-progress-label">${done}/${KO_EXTRAS_TOTAL} completados</span>
      </div>
      <section class="ko-extras-step ko-extras-step--semi">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--semi">1</span> 4 semifinalistas</h4>
        <p class="ko-extras-step-hint"><strong>2 equipos del lado IZQUIERDO</strong> + <strong>2 del lado DERECHO</strong>.</p>
        <div class="ko-semis-sides-stack">
          ${KO_SEMI_SIDES.map(side => koSemiSideBlockHTML(side.key, ex)).join('')}
        </div>
      </section>
      <section class="ko-extras-step ko-extras-step--final${semisFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--final">2</span> 2 finalistas</h4>
        <p class="ko-extras-step-hint ko-extras-step-hint--final">Elige de entre tus semifinalistas <strong>1 de cada lado del cuadro</strong>.</p>
        <div class="ko-finals-sides-stack">
          ${KO_FINAL_SIDES.map(s => koFinalSideBlockHTML(s, ex)).join('')}
        </div>
      </section>
      <section class="ko-extras-step ko-extras-step--champion${finalsFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--gold">3</span> Campeón del mundo</h4>
        <p class="ko-extras-step-hint ko-extras-step-hint--champion">Elige <strong>UN SOLO</strong> campeón entre tus 2 finalistas.</p>
        ${koChampionBlockHTML(ex)}
      </section>`;
  }

  function koExtraSlotHTML(field, index, selected, label) {
    const ex = getActiveKoData().extras;
    const filled = !!selected;
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === field && koActiveExtraSlot.index === index;
    const flag = filled && typeof flagHTML === 'function'
      ? flagHTML(selected, 32)
      : '<span class="ko-extra-plus" aria-hidden="true">+</span>';
    const name = filled ? teamNameKo(selected) : 'Vacío';
    let roleBadge = '';
    if (filled) {
      const fieldRole = koFieldToRole(field);
      if (fieldRole) roleBadge = koRoleBadgeHTML(fieldRole, 'md');
    }
    const cornerChip = '';
    return `<div class="ko-extra-slot${filled ? ' ko-extra-slot--filled' : ''}${isActive ? ' ko-extra-slot--active' : ''} ko-extra-slot--${field}">
      <span class="ko-extra-slot-num">${label}</span>
      <button type="button" class="ko-extra-slot-card" data-ko-extra-slot data-ko-extra-field="${field}" data-ko-extra-index="${index}" aria-pressed="${isActive}">
        ${cornerChip}
        ${roleBadge ? `<span class="ko-extra-slot-badge">${roleBadge}</span>` : ''}
        <span class="ko-extra-slot-flag">${flag}</span>
        <span class="ko-extra-slot-name">${name}</span>
        ${filled ? `<span class="ko-extra-clear" data-ko-extra-clear data-ko-extra-field="${field}" data-ko-extra-index="${index}" role="button" aria-label="Quitar equipo">×</span>` : ''}
      </button>
    </div>`;
  }

  function koPickerTeamBtn(code, field, ex, used, opts) {
    opts = opts || {};
    const roles = getKoPickerRoles(code, ex);
    const taken = used.has(code);
    const zoneBlocked = !!opts.zoneBlocked;
    const cls = ['ko-r32-pick'];
    if (roles.includes('semi')) cls.push('ko-r32-pick--semi');
    if (roles.includes('finalist')) cls.push('ko-r32-pick--final');
    if (roles.includes('champion')) cls.push('ko-r32-pick--champ');
    if (taken) cls.push('ko-r32-pick--taken');
    if (zoneBlocked) cls.push('ko-r32-pick--zone-blocked');
    const badge = roles.length
      ? `<span class="ko-r32-pick-badges${roles.length > 1 ? ' ko-r32-pick-badges--multi' : ''}">${koRoleBadgesHTML(roles, roles.length > 1 ? 'xs' : 'sm')}</span>`
      : '';
    const flag = typeof flagHTML === 'function' ? flagHTML(code, field === 'semis' ? 24 : 32) : '';
    if (roles.length > 1) cls.push('ko-r32-pick--multi-badge');
    const disabled = taken;
    const zoneAttrs = zoneBlocked && opts.zoneBlockMsg
      ? ` data-ko-zone-blocked="1" data-ko-zone-msg="${opts.zoneBlockMsg.replace(/"/g, '&quot;')}"`
      : '';
    return `<button type="button" class="${cls.join(' ')}" data-ko-pick-code="${code}" data-ko-picker-field="${field}"${disabled ? ' disabled' : ''}${zoneAttrs} aria-label="${teamNameKo(code)}">
      ${badge}
      ${flag}
      <span class="ko-r32-pick-name">${teamNameKoShort(code, field === 'semis' ? 11 : 14)}</span>
    </button>`;
  }

  function koSemiPickerGridHTML(corner, ex, used) {
    const teams = getKoR32TeamsByCorner(corner);
    return `<div class="ko-section-picker-grid ko-section-picker-grid--semis-${corner.toLowerCase()}" role="listbox" aria-label="Equipos ${corner}">
      ${teams.map(t => koPickerTeamBtn(t.code, 'semis', ex, used)).join('')}
    </div>`;
  }

  function koSemiPickerSideHTML(corner, ex, used, activeCorner) {
    const cls = ['ko-semi-picker-side', `ko-semi-picker-side--${corner.toLowerCase()}`];
    if (activeCorner === corner) cls.push('is-highlighted');
    else if (activeCorner && activeCorner !== corner) cls.push('is-dimmed');
    const idx = KO_SEMI_CORNER_KEYS.indexOf(corner);
    return `<div class="${cls.join(' ')}">
      <p class="ko-semi-side-label"><span class="ko-corner-chip ko-corner-chip--${corner.toLowerCase()}">${corner}</span> ${KO_SEMI_CORNER_LABELS[idx]}</p>
      ${koSemiPickerGridHTML(corner, ex, used)}
    </div>`;
  }

  function koFinalSideBlockHTML(sideCfg, ex) {
    const index = sideCfg.index;
    const used = getUsedExtraCodes(ex, 'finalists', koActiveExtraSlot);
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === 'finalists' && koActiveExtraSlot.index === index;
    const cls = ['ko-final-side-block', `ko-final-side-block--${sideCfg.key}`];
    if (isActive) cls.push('is-active');
    if (ex.finalists[index]) cls.push('is-filled');
    const semis = ex.semis.filter(code => code && getKoFinalistBracketSide(code, ex) === sideCfg.bracketSide);
    return `<div class="${cls.join(' ')}" id="ko-final-side-${sideCfg.key}">
      <p class="ko-semi-side-title">${sideCfg.title}</p>
      <p class="ko-zone-pick-hint ko-zone-pick-hint--final">👆 1. Toca un semifinalista (bandera)</p>
      <div class="ko-section-picker-grid ko-section-picker-grid--finalists-pick" role="listbox" aria-label="${sideCfg.title}">
        ${semis.map(code => koPickerTeamBtn(code, 'finalists', ex, used)).join('')}
      </div>
      <p class="ko-zone-pick-hint ko-zone-pick-hint--final-step">👆 2. Queda en la casilla</p>
      <div class="ko-extras-row ko-extras-row--1">
        ${koExtraSlotHTML('finalists', index, ex.finalists[index], 'FINALISTA')}
      </div>
      <p class="ko-final-side-foot">Toca una bandera o la casilla de abajo</p>
    </div>`;
  }

  function koChampionBlockHTML(ex) {
    const used = getUsedExtraCodes(ex, 'champion', koActiveExtraSlot);
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === 'champion';
    const finals = ex.finalists.filter(Boolean);
    return `<div class="ko-champion-block${isActive ? ' is-active' : ''}${ex.champion ? ' is-filled' : ''}" id="ko-champion-block">
      <p class="ko-zone-pick-hint ko-zone-pick-hint--champion">👆 1. Toca un finalista (bandera)</p>
      <div class="ko-section-picker-grid ko-section-picker-grid--champion-pick" role="listbox" aria-label="Elige campeón entre finalistas">
        ${finals.map(code => koPickerTeamBtn(code, 'champion', ex, used)).join('')}
      </div>
      <p class="ko-zone-pick-hint ko-zone-pick-hint--champion-step">👆 2. Campeón del mundo</p>
      <div class="ko-champion-block-inner">
        <img src="/assets/wc-trophy.svg" class="ko-champion-block-trophy" alt="" onerror="this.style.display='none'"/>
        <div class="ko-champion-block-slot">
          ${koExtraSlotHTML('champion', 0, ex.champion, 'CAMPEÓN')}
        </div>
      </div>
      <p class="ko-champion-block-foot">Toca una bandera de tus finalistas</p>
    </div>`;
  }

  function koSemiZoneBlockHTML(zone, side, ex, used) {
    const filled = !!ex.semis[zone.index];
    const teams = getKoR32TeamsByCorner(zone.corner);
    const blockMsg = filled ? getSemiZoneRepeatMessage(side, zone, ex) : '';
    const blockMsgPlain = blockMsg.replace(/<[^>]+>/g, '');
    const zoneCls = ['ko-semi-zone', `ko-semi-zone--${zone.corner.toLowerCase()}`];
    if (filled) zoneCls.push('is-zone-done');
    const pickerOpts = filled ? { zoneBlocked: true, zoneBlockMsg: blockMsgPlain } : {};
    return `<div class="${zoneCls.join(' ')}" data-ko-semi-zone="${zone.corner}">
      <p class="ko-zone-pick-hint">👇 ${zone.pickLabel}</p>
      <div class="ko-section-picker-grid ko-section-picker-grid--semis-zone" role="listbox" aria-label="${zone.pickLabel}">
        ${teams.map(t => koPickerTeamBtn(t.code, 'semis', ex, used, pickerOpts)).join('')}
      </div>
    </div>`;
  }

  function koSemiSideBlockHTML(sideKey, ex) {
    const side = KO_SEMI_SIDES.find(s => s.key === sideKey);
    if (!side) return '';
    const used = getUsedExtraCodes(ex, 'semis', koActiveExtraSlot);
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === 'semis' && side.indices.includes(koActiveExtraSlot.index);
    const cls = ['ko-semi-side-block', `ko-semi-side-block--${sideKey}`];
    if (isActive) cls.push('is-active');
    if (side.indices.every(i => ex.semis[i])) cls.push('is-filled');
    const zoneBlocks = side.zones.map((zone, zi) => {
      const divider = zi > 0
        ? `<div class="ko-semi-zone-divider" role="separator"><span>Y ahora elige en la otra mitad ↓</span></div>`
        : '';
      return divider + koSemiZoneBlockHTML(zone, side, ex, used);
    }).join('');
    const slots = side.zones.map(zone =>
      koExtraSlotHTML('semis', zone.index, ex.semis[zone.index], zone.slotLabel)
    ).join('');
    return `<div class="${cls.join(' ')}" id="ko-semi-side-${sideKey}">
      <p class="ko-semi-side-title">${side.title}</p>
      <p class="ko-semi-side-hint">${side.hint}</p>
      <div class="ko-semi-zones-stack">${zoneBlocks}</div>
      <p class="ko-semi-slots-summary">${side.slotsSummary}</p>
      <div class="ko-extras-row ko-extras-row--2">${slots}</div>
    </div>`;
  }

  function koSectionPickerHTML(field) {
    const ex = getActiveKoData().extras;
    const used = getUsedExtraCodes(ex, field, koActiveExtraSlot);
    let teams = [];
    let hint = '';
    if (field === 'semis') {
      const activeSideKey = koActiveExtraSlot && koActiveExtraSlot.field === 'semis'
        ? getSemiSideKeyForIndex(koActiveExtraSlot.index)
        : null;
      if (koActiveExtraSlot && koActiveExtraSlot.field === 'semis') {
        const side = KO_SEMI_SIDES.find(s => s.key === activeSideKey);
        hint = side
          ? `Elige un equipo del <strong>lado ${side.short.toLowerCase()}</strong>`
          : 'Elige un equipo del mismo lado del cuadro';
      } else {
        const nextIdx = ex.semis.findIndex(s => !s);
        if (nextIdx >= 0) {
          const side = KO_SEMI_SIDES.find(s => s.indices.includes(nextIdx));
          hint = side
            ? `Falta un semifinalista del <strong>lado ${side.short.toLowerCase()}</strong>. Toca una bandera o una casilla.`
            : 'Toca una bandera o una casilla para elegir semifinalistas.';
        } else {
          hint = 'Las 4 casillas están llenas. Toca una casilla para cambiarla.';
        }
      }
      return `<div class="ko-section-picker" data-ko-picker-field="${field}">
        <p class="ko-section-picker-hint">${hint}</p>
        <div class="ko-semis-sides-stack">
          ${KO_SEMI_SIDES.map(s => {
            const used2 = getUsedExtraCodes(ex, 'semis', koActiveExtraSlot);
            const teams = getKoR32TeamsBySide(s.key);
            const cls = ['ko-semi-side-block', `ko-semi-side-block--${s.key}`];
            if (activeSideKey === s.key) cls.push('is-active');
            return `<div class="${cls.join(' ')}">
              <p class="ko-semi-side-title">${s.title}</p>
              <div class="ko-section-picker-grid ko-section-picker-grid--semis-side" role="listbox">
                ${teams.map(t => koPickerTeamBtn(t.code, 'semis', ex, used2)).join('')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    } else if (field === 'finalists') {
      const semis = ex.semis.filter(Boolean);
      if (semis.length < 4) {
        return `<p class="ko-section-locked">🔒 Completa los <strong>4 semifinalistas</strong> para desbloquear los finalistas.</p>`;
      }
      const activeIdx = koActiveExtraSlot && koActiveExtraSlot.field === 'finalists'
        ? koActiveExtraSlot.index
        : (ex.finalists[0] ? 1 : 0);
      const targetSide = getFinalSlotBracketSide(activeIdx);
      teams = semis
        .filter(code => getKoFinalistBracketSide(code, ex) === targetSide)
        .map(code => ({ code, name: teamNameKo(code) }));
      const n = ex.finalists.filter(Boolean).length;
      hint = koActiveExtraSlot && koActiveExtraSlot.field === 'finalists'
        ? `Elige uno para <strong>${KO_FINAL_SLOT_LABELS[koActiveExtraSlot.index]}</strong>`
        : (n < 2 ? `Elige ${n === 0 ? 'uno del lado izquierdo' : 'uno del lado derecho'}.` : 'Toca una casilla de finalista para cambiarla.');
    } else if (field === 'champion') {
      const finals = ex.finalists.filter(Boolean);
      if (finals.length < 2) {
        return `<p class="ko-section-locked">🔒 Completa los <strong>2 finalistas</strong> para elegir campeón.</p>`;
      }
      teams = finals.map(code => ({ code, name: teamNameKo(code) }));
      hint = koActiveExtraSlot && koActiveExtraSlot.field === 'champion'
        ? 'Elige campeón entre tus 2 finalistas'
        : 'Toca uno de tus finalistas para ser <strong>campeón</strong>';
    }
    return `<div class="ko-section-picker" data-ko-picker-field="${field}">
      <p class="ko-section-picker-hint">${hint}</p>
      <div class="ko-section-picker-grid ko-section-picker-grid--${field}" role="listbox">
        ${teams.map(t => koPickerTeamBtn(t.code, field, ex, used)).join('')}
      </div>
    </div>`;
  }

  function bindKoExtrasClicks() {
    if (koExtrasClickBound) return;
    const root = document.getElementById('koExtrasGrid');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const clearEl = e.target.closest('[data-ko-extra-clear]');
      if (clearEl) {
        e.preventDefault();
        e.stopPropagation();
        setKoExtra(clearEl.getAttribute('data-ko-extra-field'), parseInt(clearEl.getAttribute('data-ko-extra-index'), 10), '');
        koActiveExtraSlot = null;
        return;
      }
      const slotBtn = e.target.closest('[data-ko-extra-slot]');
      if (slotBtn) {
        e.preventDefault();
        if (!requireKoUserForPick()) return;
        const field = slotBtn.getAttribute('data-ko-extra-field');
        const index = parseInt(slotBtn.getAttribute('data-ko-extra-index'), 10);
        if (field === 'finalists' && getActiveKoData().extras.semis.filter(Boolean).length < 4) return;
        if (field === 'champion' && getActiveKoData().extras.finalists.filter(Boolean).length < 2) return;
        koActiveExtraSlot = { field, index };
        koExtraWarn = '';
        renderKnockoutExtras();
        return;
      }
      const pickBtn = e.target.closest('[data-ko-pick-code][data-ko-picker-field]');
      if (!pickBtn || pickBtn.disabled) return;
      e.preventDefault();
      if (pickBtn.getAttribute('data-ko-zone-blocked')) {
        const plain = pickBtn.getAttribute('data-ko-zone-msg') || '';
        koExtraWarn = plain || 'Ya elegiste un equipo de esta zona. Elige el de la otra mitad.';
        renderKnockoutExtras();
        return;
      }
      assignKoExtra(pickBtn.getAttribute('data-ko-picker-field'), pickBtn.getAttribute('data-ko-pick-code'));
    });
    koExtrasClickBound = true;
  }

  function renderKnockoutExtras() {
    const section = document.getElementById('koExtrasSection');
    const grid = document.getElementById('koExtrasGrid');
    if (!grid) return;
    if (!shouldShowKoExtrasSection()) {
      if (section) section.classList.add('hidden');
      koActiveExtraSlot = null;
      koExtraWarn = '';
      grid.innerHTML = '';
      return;
    }
    if (section) section.classList.remove('hidden');
    const ex = getActiveKoData().extras;
    if (isKoExtrasEditable()) {
      bindKoExtrasClicks();
      grid.innerHTML = koExtrasEditorHTML(ex);
      if (koActiveExtraSlot && koActiveExtraSlot.field === 'semis') {
        const sideKey = getSemiSideKeyForIndex(koActiveExtraSlot.index) || 'left';
        requestAnimationFrame(() => {
          const block = document.getElementById(`ko-semi-side-${sideKey}`);
          if (block) block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      } else if (koActiveExtraSlot && koActiveExtraSlot.field === 'finalists') {
        const sideKey = koActiveExtraSlot.index === 0 ? 'left' : 'right';
        requestAnimationFrame(() => {
          const block = document.getElementById(`ko-final-side-${sideKey}`);
          if (block) block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      } else if (koActiveExtraSlot && koActiveExtraSlot.field === 'champion') {
        requestAnimationFrame(() => {
          const block = document.getElementById('ko-champion-block');
          if (block) block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    } else {
      koActiveExtraSlot = null;
      koExtraWarn = '';
      grid.innerHTML = koExtrasSummaryHTML(ex);
    }
  }

  function showKoToast(id, ms) {
    const toast = document.getElementById(id);
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms || 5000);
  }

  function maybeCelebrateKoExtrasComplete() {
    const ed = koExtrasDone();
    const extrasComplete = ed >= KO_EXTRAS_TOTAL;
    if (!_koExtrasCelebrationInit) {
      _koExtrasCelebrationInit = true;
      koWasExtrasComplete = extrasComplete;
      return;
    }
    if (extrasComplete && !koWasExtrasComplete) {
      if (typeof fireConfetti === 'function') fireConfetti();
      showKoToast('koChampionToast', 5500);
      requestAnimationFrame(() => {
        const target = isKoRoundPickable('r32') || isKoRoundClosed('r32') ? document.getElementById('koBracket') : document.getElementById('koExtrasSection');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    koWasExtrasComplete = extrasComplete;
  }

  function updateKnockoutStatus() {
    const st = document.getElementById('koStatus');
    const btn = document.getElementById('btnExportKo');
    if (!st || !isKnockoutAccessible()) return;
    const md = koMatchesDone();
    const req = koMatchesRequired();
    const ed = koExtrasDone();
    const complete = isKnockoutComplete();
    if (!getActiveKoUser()) {
      st.textContent = 'Elige un participante arriba para empezar.';
    } else if (complete) {
      st.textContent = '✓ Todo listo — puedes exportar el PDF';
    } else if (ed >= KO_EXTRAS_TOTAL && req === 0) {
      st.textContent = isKoRoundPickable('r32')
        ? 'Campeón elegido ✓ — esperando cruces completos para marcar partidos'
        : isKoRoundClosed('r32')
          ? 'Campeón elegido ✓ — dieciseisavos cerrados · PDF bloqueado hasta completar'
          : `Campeón elegido ✓ — dieciseisavos abren el ${formatKoOpensAtShort('r32')} · PDF bloqueado hasta completar`;
    } else if (ed >= KO_EXTRAS_TOTAL) {
      const closeHint = isKoRoundPickable('r32') ? ` · cierra ${formatKoRoundCloseShort('r32')}` : isKoRoundClosed('r32') ? ' · dieciseisavos cerrados' : '';
      st.textContent = `Campeón elegido ✓ — quiniela: ${md}/${req} partidos${closeHint} · PDF al completar todo`;
    } else if (isKoExtrasLocked() && ed < KO_EXTRAS_TOTAL) {
      st.textContent = `Partidos (${req} activos): ${md}/${req} · Especiales cerrados (${ed}/${KO_EXTRAS_TOTAL})`;
    } else {
      st.textContent = `Especiales: ${ed}/${KO_EXTRAS_TOTAL} · Partidos (${req} activos): ${md}/${req} · PDF bloqueado hasta completar`;
    }
    st.className = complete
      ? 'text-xs text-green-400 font-medium mt-3'
      : 'text-xs text-yellow-500 font-medium mt-3';
    if (btn) {
      btn.classList.toggle('is-locked', !complete);
      btn.classList.toggle('btn-export-ko-ready', complete);
      btn.setAttribute('aria-disabled', complete ? 'false' : 'true');
    }
    if (!_koStatusCelebrationInit) {
      _koStatusCelebrationInit = true;
      koWasComplete = complete;
    } else if (complete && !koWasComplete) {
      showKoToast('koCelebrationToast', 4500);
      koWasComplete = complete;
    } else {
      koWasComplete = complete;
    }
    maybeCelebrateKoExtrasComplete();
    const clearBtn = document.getElementById('btnClearKo');
    const clearMatchesBtn = document.getElementById('btnClearKoMatches');
    const canClear = !!getActiveKoUser();
    [clearBtn, clearMatchesBtn].forEach(btn => {
      if (!btn) return;
      btn.disabled = !canClear;
      btn.style.opacity = canClear ? '1' : '.45';
      btn.style.pointerEvents = canClear ? '' : 'none';
    });
    const champEl = document.getElementById('koChampionDisplay');
    if (champEl) {
      champEl.textContent = getActiveKoData().extras.champion ? teamNameKo(getActiveKoData().extras.champion) : '—';
    }
  }

  function renderKnockout() {
    loadKnockoutStore();
    const preview = document.getElementById('koPreviewBadge');
    if (preview) preview.classList.toggle('hidden', !isKnockoutPreviewUnlocked() || isKnockoutPublicOpen());
    const subtitle = document.getElementById('koSubtitle');
    if (subtitle) {
      if (!isKnockoutAccessible()) {
        subtitle.textContent = 'Apertura oficial el 28 jun, 10:00 (hora peninsular).';
      } else if (!isKoRoundStarted('r32')) {
        subtitle.textContent = 'Vista anticipada · plazo oficial el 28 jun, 10:00–21:00 (participante, especiales y dieciseisavos).';
      } else if (isKoRoundPickable('r32')) {
        subtitle.textContent = `Plazo abierto (10:00–21:00): elige participante, completa especiales y dieciseisavos · cierra ${formatKoRoundCloseShort('r32')}.`;
      } else if (isKoRoundClosed('r32')) {
        subtitle.textContent = 'Plazo cerrado (28 jun, 21:00) · octavos y siguientes rondas se activan en su fecha.';
      } else if (isKnockoutAccessible()) {
        subtitle.textContent = 'Eliminatorias abren el 28 jun, 10:00 · plazo único hasta las 21:00 (especiales + dieciseisavos).';
      }
    }
    refreshKnockoutUI();
  }

  const KO_PDF_C = {
    bg: [10, 14, 26], hdr: [30, 58, 95], card: [17, 24, 39], brd: [55, 65, 81],
    txt: [255, 255, 255], mut: [156, 163, 175],
    r: [239, 68, 68], y: [234, 179, 8], g: [34, 197, 94], gold: [250, 204, 21]
  };

  const KO_PDF = {
    M: 10, GAP: 3, PAGE_TOP: 10, PAGE_BOTTOM: 287,
    MATCH_H: 8.5, HEAD_H: 6.5, FOOT_H: 2,
    FLAG_W: 3.2, FLAG_H: 2.4, RADIUS: 2,
    MATCH_H_MIN: 8.8, MATCH_H_MAX: 10.6
  };

  function koPdfRoleLabel(role) {
    const m = KO_ROLE_META[role];
    return m ? m.labelPdf : '';
  }

  function koPdfSpecialsAlive(picks, ex) {
    const alive = new Set();
    const out = new Set();
    getPlayableMatches().forEach(m => {
      if (!isMatchReady(m)) return;
      const pick = picks[m.id];
      if (!isValidKoPick(pick)) return;
      const winner = pick === 'home' ? m.home : m.away;
      const loser = pick === 'home' ? m.away : m.home;
      if (getKoExtraRole(winner, ex)) alive.add(winner);
      if (getKoExtraRole(loser, ex)) out.add(loser);
    });
    out.forEach(c => alive.delete(c));
    return alive;
  }

  function koPdfChunkMatches(matches) {
    return koChunkMatches(koSortMatches(matches));
  }

  function koPdfSyncColumns(colY) {
    return [Math.max(colY[0], colY[1]), Math.max(colY[0], colY[1])];
  }

  function koPdfBg(pdf, PW, PH) {
    pdf.setFillColor(...KO_PDF_C.bg);
    pdf.rect(0, 0, PW, PH, 'F');
  }

  function koPdfFooter(pdf, PW, PH, M, name, page, total) {
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.text(`Porra Mundial 2026 · Eliminatorias · ${name}`, M, PH - 4);
    pdf.text(`${page}/${total}`, PW - M, PH - 4, { align: 'right' });
  }

  const KO_PDF_CITY_SHORT = {
    'Ciudad de México': 'CDMX',
    'San Francisco': 'S. Francisco',
    'Los Angeles': 'Los Angeles',
    'Nueva York': 'Nueva York',
    'Kansas City': 'Kansas City',
    'Monterrey': 'Monterrey'
  };

  function koPdfVenueShort(venue) {
    if (!venue) return '';
    const parts = venue.split(',');
    const city = (parts.length > 1 ? parts[parts.length - 1] : venue).trim();
    if (KO_PDF_CITY_SHORT[city]) return KO_PDF_CITY_SHORT[city];
    return city;
  }

  function koPdfTrimName(pdf, name, maxW) {
    if (maxW <= 1) return '';
    if (pdf.getTextWidth(name) <= maxW) return name;
    let t = name;
    while (t.length > 3 && pdf.getTextWidth(t + '...') > maxW) t = t.slice(0, -1);
    return t + '...';
  }

  function koPdfDrawFittedText(pdf, text, x, y, maxW, opts) {
    const baseSize = opts.size || 5;
    const align = opts.align || 'left';
    let size = baseSize;
    pdf.setFontSize(size);
    let fitted = koPdfTrimName(pdf, text, maxW);
    while (size > 3.6 && pdf.getTextWidth(fitted) > maxW) {
      size -= 0.25;
      pdf.setFontSize(size);
      fitted = koPdfTrimName(pdf, text, maxW);
    }
    if (!fitted) return;
    pdf.text(fitted, x, y, align === 'right' ? { align: 'right' } : align === 'center' ? { align: 'center' } : undefined);
  }

  function koPdfDrawMatchMeta(pdf, m, centerX, metaY, maxW) {
    pdf.setFontSize(3.2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...KO_PDF_C.mut);
    const city = koPdfVenueShort(m.venue);
    const line = `${m.date} ${m.hour} ESP${city ? ' · ' + city : ''}`;
    koPdfDrawFittedText(pdf, line, centerX, metaY, maxW, { size: 3.2, align: 'center' });
  }

  const KO_PDF_TAG = {
    semi: { bg: [126, 34, 206], bgHi: [147, 51, 234], fg: [255, 255, 255], border: [216, 180, 254], fill: [31, 41, 55] },
    finalist: { bg: [234, 88, 12], bgHi: [249, 115, 22], fg: [255, 255, 255], border: [253, 186, 116], fill: [31, 41, 55] },
    champion: { bg: [202, 138, 4], bgHi: [250, 204, 21], fg: [31, 41, 55], border: [250, 204, 21], fill: [28, 38, 24] }
  };

  function koPdfTagWidth(role) {
    if (role === 'champion') return 13;
    if (role === 'finalist') return 8.5;
    return 7;
  }

  function koPdfDrawRoleTag(pdf, role, x, y, highlight) {
    const lbl = koPdfRoleLabel(role);
    if (!lbl) return 0;
    const style = KO_PDF_TAG[role] || KO_PDF_TAG.semi;
    const w = koPdfTagWidth(role);
    const h = 3.4;

    pdf.setFillColor(...(highlight ? style.bgHi : style.bg));
    pdf.setDrawColor(...(highlight ? style.border : [70, 80, 100]));
    pdf.setLineWidth(highlight ? 0.28 : 0.15);
    pdf.roundedRect(x, y, w, h, 0.6, 0.6, 'FD');

    pdf.setFontSize(role === 'champion' ? 2.8 : 3.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...style.fg);
    pdf.text(lbl, x + w / 2, y + 2.35, { align: 'center' });
    return w;
  }

  function koPdfMatchRowHeight(startY, chunkLen) {
    const avail = KO_PDF.PAGE_BOTTOM - startY - 2;
    const rows = Math.max(chunkLen, 1);
    const raw = (avail - KO_PDF.HEAD_H - KO_PDF.FOOT_H) / rows;
    return Math.min(KO_PDF.MATCH_H_MAX, Math.max(KO_PDF.MATCH_H_MIN, raw));
  }

  function koPdfDrawSectionTitle(pdf, x, y, w, title, subtitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.text(title, x, y);
    pdf.setDrawColor(45, 55, 75);
    pdf.setLineWidth(0.15);
    pdf.line(x, y + 1.2, x + w, y + 1.2);
    if (subtitle) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(3.8);
      pdf.setTextColor(...KO_PDF_C.mut);
      pdf.text(subtitle, x, y + 3.4);
      return y + 6.2;
    }
    return y + 4;
  }

  function koPdfDrawIntroLegend(pdf, PW, y) {
    const C = KO_PDF_C;
    pdf.setFontSize(4.2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...C.mut);
    const line = 'Verde = ganador  ·  Rojo = eliminado  ·  Especiales en la tarjeta de arriba';
    pdf.text(line, PW / 2, y, { align: 'center' });
    return y + 3.5;
  }

  function koPdfFinalistsForDisplay(ex) {
    return ex.finalists.filter(code => code && code !== ex.champion);
  }

  function koPdfDrawIntro(pdf, PW, M, cardW, displayName, done, req, today, startY) {
    const C = KO_PDF_C;
    const pad = 5;
    const headerH = 11;
    const nameLines = pdf.splitTextToSize(displayName, cardW - pad * 2);
    const introH = headerH + nameLines.length * 4 + 8;
    const y = startY;

    pdf.setFillColor(12, 18, 32);
    pdf.roundedRect(M, y, cardW, introH, 2, 2, 'F');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(M, y, cardW, headerH, 2, 2, 'F');
    pdf.setDrawColor(75, 85, 99);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(M, y, cardW, introH, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...C.gold);
    pdf.text('PORRA MUNDIAL 2026 — ELIMINATORIAS', M + pad, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.5);
    pdf.setTextColor(...C.mut);
    pdf.text('Hora CEST · USA · México · Canadá', M + cardW - pad, y + 5, { align: 'right' });

    const nameY = y + headerH + 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...C.txt);
    pdf.text(nameLines, PW / 2, nameY, { align: 'center' });
    const nameEndY = nameY + (nameLines.length - 1) * 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.2);
    pdf.setTextColor(...C.mut);
    pdf.text(`${done}/${req} partidos marcados  ·  ${today}`, PW / 2, nameEndY + 4, { align: 'center' });

    return y + introH + 2;
  }

  function koPdfDrawExtraListRow(pdf, leftLabel, code, cache, x, y, w, h, opts) {
    const C = KO_PDF_C;
    const { FLAG_W, FLAG_H } = KO_PDF;
    const pad = 1.2;
    const labelW = opts && opts.labelW ? opts.labelW : 12;
    const bg = opts && opts.bg;
    const border = opts && opts.border;
    const nameX = x + labelW;

    if (bg) {
      pdf.setFillColor(...bg);
      pdf.setDrawColor(...(border || [55, 65, 81]));
      pdf.setLineWidth(0.2);
      pdf.roundedRect(x, y, w, h - 0.2, 0.45, 0.45, 'FD');
    } else {
      pdf.setDrawColor(40, 50, 68);
      pdf.setLineWidth(0.08);
      pdf.line(x, y + h - 0.15, x + w, y + h - 0.15);
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize((opts && opts.labelSize) || 4.2);
    pdf.setTextColor(...((opts && opts.labelColor) || C.mut));
    pdf.text(leftLabel, x + pad, y + h / 2 + 0.35);

    if (!code) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(4.8);
      pdf.setTextColor(...C.mut);
      pdf.text('—', nameX, y + h / 2 + 0.35);
      return;
    }

    const img = cache[code];
    let tx = nameX;
    if (img) {
      pdf.addImage(img, 'PNG', tx, y + (h - FLAG_H) / 2, FLAG_W, FLAG_H);
      tx += FLAG_W + 0.8;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5);
    pdf.setTextColor(...C.txt);
    koPdfDrawFittedText(pdf, teamNameKo(code), tx, y + h / 2 + 0.35, x + w - tx - pad, { size: 5, align: 'left' });
  }

  function koPdfDrawExtrasCard(pdf, data, cache, x, y, w) {
    const C = KO_PDF_C;
    const pad = 3;
    const headerH = 5;
    const rowH = 4.8;
    const gap = 1.1;
    const innerW = w - pad * 2;
    const colGap = 2.5;
    const leftW = innerW * 0.57;
    const rightW = innerW - leftW - colGap;
    const semiColW = (leftW - gap) / 2;
    const semiBlockH = rowH * 2 + gap;
    const bodyH = 2.6 + Math.max(semiBlockH, rowH * 2 + gap);
    const cardH = headerH + pad + bodyH + 2 + pad;

    pdf.setFillColor(...C.card);
    pdf.setDrawColor(...C.brd);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, y, w, cardH, KO_PDF.RADIUS, KO_PDF.RADIUS, 'FD');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(x, y, w, headerH, KO_PDF.RADIUS, KO_PDF.RADIUS, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(251, 191, 36);
    pdf.text('TUS ESPECIALES', x + pad, y + 3.5);

    const bodyY = y + headerH + 2.4;
    const lx = x + pad;

    pdf.setFontSize(3.6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...C.mut);
    pdf.text('SEMIFINALISTAS', lx, bodyY);

    const semiY = bodyY + 2;
    [[0, 1], [2, 3]].forEach((pair, ri) => {
      pair.forEach((idx, ci) => {
        const code = data.extras.semis[idx];
        const rx = lx + ci * (semiColW + gap);
        const ry = semiY + ri * (rowH + gap);
        koPdfDrawExtraListRow(pdf, KO_SEMI_CORNER_KEYS[idx], code, cache, rx, ry, semiColW, rowH, {
          labelW: 6.5,
          bg: [26, 20, 38],
          border: [88, 48, 150]
        });
      });
    });

    const rx0 = lx + leftW + colGap;
    pdf.setFontSize(3.6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...C.mut);
    pdf.text('PODIO', rx0, bodyY);

    const champ = data.extras.champion;
    const finalist = koPdfFinalistsForDisplay(data.extras)[0] || '';
    const podiumY = semiY;
    koPdfDrawExtraListRow(pdf, 'CAMPEON', champ, cache, rx0, podiumY, rightW, rowH, {
      labelW: 14,
      labelSize: 4.2,
      labelColor: KO_PDF_TAG.champion.border,
      bg: [32, 40, 22],
      border: KO_PDF_TAG.champion.border
    });
    koPdfDrawExtraListRow(pdf, 'FINALISTA', finalist, cache, rx0, podiumY + rowH + gap, rightW, rowH, {
      labelW: 14,
      labelSize: 4.2,
      labelColor: KO_PDF_TAG.finalist.border,
      bg: [42, 28, 16],
      border: KO_PDF_TAG.finalist.border
    });

    pdf.setFontSize(3.4);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...C.mut);
    pdf.text('Morado = semi  ·  Naranja = final  ·  Dorado = campeon', x + w / 2, y + cardH - 1.5, { align: 'center' });

    return y + cardH + 2.5;
  }

  function koPdfQualShort() {
    return '';
  }

  function koPdfDrawTeamCell(pdf, code, isWin, isLose, role, x, y, w, h, cache, alignRight) {
    const C = KO_PDF_C;
    const { FLAG_W, FLAG_H } = KO_PDF;
    const pad = 0.9;

    if (isWin) {
      pdf.setFillColor(18, 42, 32);
      pdf.setDrawColor(52, 211, 153);
      pdf.setLineWidth(0.32);
      pdf.roundedRect(x, y, w, h, 0.45, 0.45, 'FD');
    } else if (isLose) {
      pdf.setFillColor(32, 20, 20);
      pdf.setDrawColor(248, 113, 113);
      pdf.setLineWidth(0.22);
      pdf.roundedRect(x, y, w, h, 0.45, 0.45, 'FD');
    } else {
      pdf.setFillColor(20, 26, 38);
      pdf.setDrawColor(55, 65, 81);
      pdf.setLineWidth(0.1);
      pdf.roundedRect(x, y, w, h, 0.45, 0.45, 'FD');
    }

    const img = cache[code];
    const nameY = y + h / 2 + 0.45;
    const nameColor = isWin ? [220, 252, 231] : isLose ? [254, 205, 211] : C.txt;

    if (alignRight) {
      let tx = x + w - pad;
      if (img) {
        tx -= FLAG_W;
        pdf.addImage(img, 'PNG', tx, y + (h - FLAG_H) / 2, FLAG_W, FLAG_H);
        tx -= 0.55;
      }
      const nameMax = Math.max(6, tx - x - pad);
      pdf.setFont('helvetica', isWin ? 'bold' : 'normal');
      pdf.setTextColor(...nameColor);
      koPdfDrawFittedText(pdf, teamNameKo(code), tx, nameY, nameMax, { size: 4.8, align: 'right' });
    } else {
      let tx = x + pad;
      if (img) {
        pdf.addImage(img, 'PNG', tx, y + (h - FLAG_H) / 2, FLAG_W, FLAG_H);
        tx += FLAG_W + 0.55;
      }
      const nameMax = Math.max(6, x + w - pad - tx);
      pdf.setFont('helvetica', isWin ? 'bold' : 'normal');
      pdf.setTextColor(...nameColor);
      koPdfDrawFittedText(pdf, teamNameKo(code), tx, nameY, nameMax, { size: 4.8, align: 'left' });
    }
  }

  function koPdfDrawMatchRow(pdf, m, pick, xOff, my, CW, cache, stripe, ex, matchH, showSpecials) {
    const pad = 1.8;
    const centerX = xOff + CW / 2;
    const vsW = 5.5;
    const cellW = (CW - vsW - pad * 2) / 2;
    const cellX1 = xOff + pad;
    const cellX2 = xOff + CW - pad - cellW;
    const metaY = my + 1.5;
    const teamY = my + 2.85;
    const cellH = matchH - 3.35;

    if (stripe) {
      pdf.setFillColor(20, 28, 42);
      pdf.rect(xOff + 0.5, my, CW - 1, matchH - 0.12, 'F');
    }

    koPdfDrawMatchMeta(pdf, m, centerX, metaY, CW - pad * 2);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(3.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('vs', centerX, teamY + cellH / 2 + 0.15, { align: 'center' });

    const homeRole = showSpecials ? getKoExtraRole(m.home, ex) : '';
    const awayRole = showSpecials ? getKoExtraRole(m.away, ex) : '';
    koPdfDrawTeamCell(pdf, m.home, pick === 'home', pick === 'away', homeRole, cellX1, teamY, cellW, cellH, cache, false);
    koPdfDrawTeamCell(pdf, m.away, pick === 'away', pick === 'home', awayRole, cellX2, teamY, cellW, cellH, cache, true);
  }

  function koPdfDrawMatchColumn(pdf, matches, xOff, y, CW, picks, cache, label, ex, matchH, showSpecials) {
    const { HEAD_H, FOOT_H, RADIUS } = KO_PDF;
    const groupH = HEAD_H + matches.length * matchH + FOOT_H;

    pdf.setFillColor(...KO_PDF_C.card);
    pdf.setDrawColor(...KO_PDF_C.brd);
    pdf.roundedRect(xOff, y, CW, groupH, RADIUS, RADIUS, 'FD');
    pdf.setFillColor(...KO_PDF_C.hdr);
    pdf.roundedRect(xOff, y, CW, HEAD_H, RADIUS, RADIUS, 'F');
    pdf.setFillColor(96, 165, 250);
    pdf.rect(xOff, y + HEAD_H - 0.6, CW, 0.6, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(...KO_PDF_C.txt);
    pdf.text(label, xOff + 2.2, y + 4.2);

    const done = matches.filter(m => isValidKoPick(picks[m.id])).length;
    pdf.setFontSize(4.8);
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${done}/${matches.length}`, xOff + CW - 2.2, y + 4.2, { align: 'right' });

    let gy = y + HEAD_H;
    matches.forEach((m, idx) => {
      koPdfDrawMatchRow(pdf, m, picks[m.id], xOff, gy + idx * matchH, CW, cache, idx % 2 === 1, ex, matchH, showSpecials);
    });

    return y + groupH;
  }

  async function exportKnockoutPDFInner() {
    const user = getActiveKoUser();
    const data = getActiveKoData();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const C = KO_PDF_C;
    const PW = 210;
    const PH = 297;
    const { M, GAP, PAGE_TOP, PAGE_BOTTOM } = KO_PDF;
    const CW = (PW - M * 2 - GAP) / 2;
    const cardW = PW - M * 2;
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const displayName = user.replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const req = koMatchesRequired();
    const done = koMatchesDone();

    const codes = new Set();
    getPlayableMatches().forEach(m => { codes.add(m.home); codes.add(m.away); });
    data.extras.semis.concat(data.extras.finalists, [data.extras.champion]).filter(Boolean).forEach(c => codes.add(c));
    if (typeof loadTrophyDataUrl === 'function') await loadTrophyDataUrl();
    await Promise.all([...codes].map(c => typeof loadFlagDataUrl === 'function' ? loadFlagDataUrl(c) : null));
    const cache = typeof flagCache !== 'undefined' ? flagCache : {};

    koPdfBg(pdf, PW, PH);
    let y = koPdfDrawIntro(pdf, PW, M, cardW, displayName, done, req, today, M);
    y = koPdfDrawExtrasCard(pdf, data, cache, M, y, cardW);
    y = koPdfDrawSectionTitle(pdf, M, y + 1, cardW, 'TUS PARTIDOS', 'Verde = ganador  ·  Rojo = eliminado');

    const openPlayable = getExportRounds().map(r => ({
      round: r,
      matches: r.matches.filter(isMatchReady)
    })).filter(x => x.matches.length);

    let maxChunkLen = 1;
    openPlayable.forEach(({ matches }) => {
      koPdfChunkMatches(matches).forEach(chunk => {
        if (chunk.length > maxChunkLen) maxChunkLen = chunk.length;
      });
    });
    const matchH = koPdfMatchRowHeight(y + GAP, maxChunkLen);

    let col = 0;
    let colY = [y + GAP, y + GAP];

    function placeGroup(groupH, fullWidth) {
      const bottom = colY[col] + groupH;
      if (bottom > PAGE_BOTTOM) {
        if (!fullWidth && col === 0 && colY[1] + groupH <= PAGE_BOTTOM) {
          col = 1;
          return;
        }
        pdf.addPage();
        koPdfBg(pdf, PW, PH);
        colY = [PAGE_TOP, PAGE_TOP];
        col = 0;
      }
    }

    openPlayable.forEach(({ round, matches }) => {
      const chunks = koPdfChunkMatches(matches);
      chunks.forEach((chunk, ci) => {
        if (!chunk.length) return;
        const fullWidth = chunks.length === 1;
        const colW = fullWidth ? cardW : CW;
        const groupH = KO_PDF.HEAD_H + chunk.length * matchH + KO_PDF.FOOT_H;
        placeGroup(groupH, fullWidth);
        const xOff = fullWidth ? M : M + col * (CW + GAP);
        const label = round.label + (chunks.length > 1 ? (ci ? ' B' : ' A') : '');
        colY[col] = koPdfDrawMatchColumn(pdf, chunk, xOff, colY[col], colW, data.picks, cache, label, data.extras, matchH, false) + 2;
        if (fullWidth) {
          colY = koPdfSyncColumns(colY);
          col = 0;
        } else {
          col = col === 0 ? 1 : 0;
        }
      });
      colY = koPdfSyncColumns(colY);
      col = 0;
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      koPdfFooter(pdf, PW, PH, M, user, i, totalPages);
    }

    const safe = user.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if (typeof downloadPdfBlob === 'function') {
      downloadPdfBlob(pdf, `porra-knockout-2026-${safe}.pdf`);
    } else {
      pdf.save(`porra-knockout-2026-${safe}.pdf`);
    }
  }

  function requestKnockoutAccess() {
    if (isKnockoutAccessible()) {
      if (typeof switchPhaseTab === 'function') switchPhaseTab('extras');
      return;
    }
    showKoPasswordModal();
  }

  window.KO_TEST_MODE = KO_TEST_MODE;
  window.isKnockoutAccessible = isKnockoutAccessible;
  window.isKnockoutPublicOpen = isKnockoutPublicOpen;
  window.KO_EXTRAS_LOCK_AT = KO_EXTRAS_LOCK_AT;
  window.isKoExtrasLocked = isKoExtrasLocked;
  window.isKnockoutPreviewUnlocked = isKnockoutPreviewUnlocked;
  window.isKnockoutComplete = isKnockoutComplete;
  window.renderKnockout = renderKnockout;
  window.setActiveKoUser = setActiveKoUser;
  window.PARTICIPANTS = PARTICIPANTS;
  window.pickKoResult = pickKoResult;
  window.setKoExtra = setKoExtra;
  window.submitKoPassword = submitKoPassword;
  window.hideKoPasswordModal = hideKoPasswordModal;
  window.clearKnockoutMatches = clearKnockoutMatches;
  window.clearKnockoutAll = clearKnockoutAll;
  window.clearKnockoutPicks = clearKnockoutPicks;
  window.exportKnockoutPDF = exportKnockoutPDF;
  window.syncKnockoutGroupSeeds = syncKnockoutGroupSeeds;
  window.requestKnockoutAccess = requestKnockoutAccess;
  window.KO_ROUNDS = KO_ROUNDS;
  window.KO_ROUND_OPENS = KO_ROUND_OPENS;
  window.KO_ROUND_CLOSES = KO_ROUND_CLOSES;
  window.isKoRoundStarted = isKoRoundStarted;
  window.isKoRoundClosed = isKoRoundClosed;
  window.isKoRoundPickable = isKoRoundPickable;
  window.isKoRoundOpen = isKoRoundOpen;
  window.getCountdownToKoRoundClose = getCountdownToKoRoundClose;
  window.formatKoRoundCloseShort = formatKoRoundCloseShort;

  bindKoViewportResize();
  loadKnockoutStore();
})();
